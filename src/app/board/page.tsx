"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flame,
  HelpCircle,
  Lightbulb,
  Loader2,
  LogOut,
  Mic,
  RotateCcw,
  Search,
  Vote,
} from "lucide-react";
import { TopicCard } from "@/components/TopicCard";
import { MAX_VOTES } from "@/lib/constants";
import { NewTopicModal } from "@/components/NewTopicModal";
import { TutorialModal } from "@/components/TutorialModal";
import { IgniaLogo, Pill, PillButton, SquareButton, Eyebrow } from "@/components/ui";

interface User {
  id: string;
  name: string;
  is_admin: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  type: "speaker_led" | "orphan";
  proposed_by: string;
  proposed_by_name: string;
  speaker_id: string | null;
  speaker_name: string | null;
  vote_count: number;
  created_at: string;
}

type ModalType = "pitch" | "request" | null;

export default function BoardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [phase, setPhase] = useState<"submission" | "voting">("submission");
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const votesUsed = Object.values(myVotes).reduce((sum, n) => sum + n, 0);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, topicsRes, phaseRes, votesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/topics"),
        fetch("/api/phase"),
        fetch("/api/my-votes"),
      ]);

      if (!userRes.ok) {
        router.push("/");
        return;
      }

      const userData = await userRes.json();
      const topicsData = await topicsRes.json();
      const phaseData = await phaseRes.json();
      const votesData = await votesRes.json();

      setUser(userData.user);
      setTopics(topicsData.topics);
      setPhase(phaseData.phase);
      setMyVotes(votesData.votes);
    } catch {
      // Silently retry on next poll
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (localStorage.getItem("show_tutorial") === "1") {
      localStorage.removeItem("show_tutorial");
      setShowTutorial(true);
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleAdvancePhase() {
    await fetch("/api/phase/advance", { method: "POST" });
    fetchData();
  }

  async function handleReset() {
    if (!confirm("¿Estás seguro? Esto borra todos los temas, votos y usuarios (excepto el tuyo).")) return;
    await fetch("/api/admin/reset", { method: "POST" });
    fetchData();
  }

  async function handleClaim(topicId: string) {
    await fetch(`/api/topics/${topicId}/claim`, { method: "POST" });
    fetchData();
  }

  async function handleVote(topicId: string, delta: 1 | -1) {
    const current = myVotes[topicId] || 0;
    if (delta === 1 && votesUsed >= MAX_VOTES) return;
    if (delta === -1 && current === 0) return;

    // Optimistic update — the poll reconciles it a moment later.
    setMyVotes((prev) => {
      const next = { ...prev };
      const value = (next[topicId] || 0) + delta;
      if (value <= 0) delete next[topicId];
      else next[topicId] = value;
      return next;
    });
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, vote_count: t.vote_count + delta } : t))
    );

    await fetch(`/api/topics/${topicId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    fetchData();
  }

  async function handleCreateTopic(title: string, description: string, type: "speaker_led" | "orphan") {
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type }),
    });
    setModalOpen(null);
    fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted">
        <Loader2 size={28} strokeWidth={1.5} className="animate-spin" />
        <p className="text-lg">Cargando…</p>
      </div>
    );
  }

  const orphanTopics = topics.filter((t) => t.type === "orphan");
  const speakerTopics = topics.filter((t) => t.type === "speaker_led");
  // Voting order is fixed (oldest first) on purpose — a board that reshuffles
  // under people's fingers is impossible to follow on a projector.
  const votableTopics = topics
    .filter((t) => t.speaker_id)
    .slice()
    .reverse();
  const topVotes = Math.max(0, ...votableTopics.map((t) => t.vote_count));
  const votesLeft = Math.max(0, MAX_VOTES - votesUsed);

  const adminButtons = (
    <>
      <SquareButton onClick={handleAdvancePhase} variant="secondary" className="flex-1 sm:flex-none">
        {phase === "submission" ? (
          <>
            <Vote size={16} strokeWidth={1.5} />
            Iniciar votación
          </>
        ) : (
          <>
            <ArrowLeft size={16} strokeWidth={1.5} />
            Volver a propuestas
          </>
        )}
      </SquareButton>
      <SquareButton onClick={handleReset} variant="danger" className="flex-1 sm:flex-none">
        <RotateCcw size={16} strokeWidth={1.5} />
        Reiniciar todo
      </SquareButton>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-40 shrink-0 border-b border-line px-4 sm:px-6 py-3 sm:py-4
          bg-[var(--background)]/85 backdrop-blur-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <IgniaLogo className="h-6 sm:h-7 w-[86px] sm:w-[100px] shrink-0" />
            <div className="h-6 w-px bg-line shrink-0" />
            <Pill tone={phase === "submission" ? "muted" : "live"} className="shrink-0">
              {phase === "submission" ? (
                <>
                  <Lightbulb size={14} strokeWidth={1.5} />
                  Propuestas
                </>
              ) : (
                <>
                  <Vote size={14} strokeWidth={1.5} />
                  Votación
                </>
              )}
            </Pill>

            {phase === "voting" && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-line shrink-0">
                <VoteBudget used={votesUsed} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-line shrink-0">
            <span className="text-muted text-sm hidden sm:inline truncate max-w-[120px]">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Salir"
              className="p-2 rounded-[var(--radius)] text-muted hover:text-destructive
                hover:bg-surface-hover transition-colors duration-200 cursor-pointer"
              title="Salir"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {phase === "submission" ? (
          <>
            {/* The two ways in. Deliberately oversized — this is the whole
                point of the submission phase, so nobody should miss it. */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3 mt-3">
              <PillButton
                size="lg"
                variant="fire"
                onClick={() => setModalOpen("pitch")}
                icon={<Lightbulb size={24} strokeWidth={1.5} />}
                className="flex-1 py-4 sm:py-5 text-lg sm:text-xl shadow-[var(--glow-fire)]"
              >
                Quiero enseñar de…
              </PillButton>
              <PillButton
                size="lg"
                variant="primary"
                onClick={() => setModalOpen("request")}
                icon={<HelpCircle size={24} strokeWidth={1.5} />}
                className="flex-1 py-4 sm:py-5 text-lg sm:text-xl"
              >
                Quiero aprender de…
              </PillButton>
            </div>
            {user?.is_admin && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">{adminButtons}</div>
            )}
          </>
        ) : (
          user?.is_admin && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">{adminButtons}</div>
          )
        )}
      </header>

      {phase === "submission" ? (
        <>
          {/* Mobile: stacked sections, single scroll. */}
          <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-8">
            <TopicSection
              variant="orphan"
              count={orphanTopics.length}
              topics={orphanTopics}
              currentUserId={user?.id || ""}
              onClaim={handleClaim}
            />
            <div className="h-px bg-[linear-gradient(90deg,transparent,var(--border),transparent)]" />
            <TopicSection
              variant="speaker"
              count={speakerTopics.length}
              topics={speakerTopics}
              currentUserId={user?.id || ""}
            />
          </div>

          {/* Desktop: side-by-side columns, independent scroll. */}
          <div className="hidden lg:flex flex-1 divide-x divide-[var(--border)] overflow-hidden">
            <div className="flex flex-col overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-line shrink-0">
                <SectionHeading variant="orphan" count={orphanTopics.length} />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <TopicItems
                  topics={orphanTopics}
                  emptyLabel="Todavía nadie pide un tema"
                  currentUserId={user?.id || ""}
                  onClaim={handleClaim}
                />
              </div>
            </div>

            <div className="flex flex-col overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-line shrink-0">
                <SectionHeading variant="speaker" count={speakerTopics.length} />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <TopicItems
                  topics={speakerTopics}
                  emptyLabel="Todavía nadie propone una charla"
                  currentUserId={user?.id || ""}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Voting phase — fixed-order grid so nothing jumps around */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
            <div className="text-center mb-6 sm:mb-8">
              <Eyebrow className="mb-2">Votación abierta</Eyebrow>
              <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2">
                Vota por las charlas <span className="text-gradient-fire">con más fuego</span> 🔥
              </h2>
              <p className="text-muted text-sm sm:text-lg">
                Tienes {MAX_VOTES} votos. Puedes poner varios en la misma charla.
              </p>
            </div>

            {/* Sticky budget bar — mobile has no room for it in the header. */}
            <div className="sm:hidden sticky top-0 z-30 -mx-4 px-4 py-3 mb-4 border-b border-line
              bg-[var(--background)]/95 backdrop-blur-md flex justify-center">
              <VoteBudget used={votesUsed} />
            </div>

            {votableTopics.length === 0 ? (
              <EmptyState label="Todavía no hay charlas para votar" />
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {votableTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    phase={phase}
                    currentUserId={user?.id || ""}
                    myVotes={myVotes[topic.id] || 0}
                    canAddVote={votesLeft > 0}
                    topVotes={topVotes}
                    onClaim={() => {}}
                    onVote={(delta) => handleVote(topic.id, delta)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <NewTopicModal
          type={modalOpen}
          onClose={() => setModalOpen(null)}
          onSubmit={handleCreateTopic}
        />
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

/* ---------- Board sub-components ---------- */

const sectionMeta = {
  orphan: {
    icon: Search,
    title: "Quieren aprender de…",
    subtitle: "Temas que alguien pidió — reclámalo y enséñalo tú",
    color: "var(--fire)",
    empty: "Todavía nadie pide un tema",
  },
  speaker: {
    icon: Mic,
    title: "Van a enseñar de…",
    subtitle: "Charlas con speaker confirmado",
    color: "var(--community)",
    empty: "Todavía nadie propone una charla",
  },
} as const;

function SectionHeading({
  variant,
  count,
}: {
  variant: keyof typeof sectionMeta;
  count: number;
}) {
  const { icon: Icon, title, subtitle, color } = sectionMeta[variant];
  return (
    <div>
      <h2 className="font-display text-lg lg:text-xl font-bold flex items-center gap-2.5">
        <Icon size={20} strokeWidth={1.5} style={{ color }} className="shrink-0" />
        {title}
        <span className="text-muted font-normal font-sans text-sm">({count})</span>
      </h2>
      <p className="text-muted text-sm lg:text-base mt-1 ml-[30px] lg:ml-0">{subtitle}</p>
    </div>
  );
}

function TopicSection({
  variant,
  count,
  topics,
  currentUserId,
  onClaim,
}: {
  variant: keyof typeof sectionMeta;
  count: number;
  topics: Topic[];
  currentUserId: string;
  onClaim?: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <SectionHeading variant={variant} count={count} />
      </div>
      <div className="space-y-3">
        <TopicItems
          topics={topics}
          emptyLabel={sectionMeta[variant].empty}
          currentUserId={currentUserId}
          onClaim={onClaim}
        />
      </div>
    </div>
  );
}

function TopicItems({
  topics,
  emptyLabel,
  currentUserId,
  onClaim,
}: {
  topics: Topic[];
  emptyLabel: string;
  currentUserId: string;
  onClaim?: (id: string) => void;
}) {
  if (topics.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <>
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          phase="submission"
          currentUserId={currentUserId}
          myVotes={0}
          canAddVote={false}
          topVotes={0}
          onClaim={() => onClaim?.(topic.id)}
          onVote={() => {}}
        />
      ))}
    </>
  );
}

/** Flame pips: how many of your votes are spent, how many are left. */
function VoteBudget({ used }: { used: number }) {
  const left = Math.max(0, MAX_VOTES - used);
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="flex items-center gap-1">
        {Array.from({ length: MAX_VOTES }).map((_, i) => (
          <Flame
            key={i}
            size={20}
            strokeWidth={1.5}
            className={i < used ? "text-fire fill-fire/25" : "text-muted/40"}
          />
        ))}
      </div>
      <span className="text-sm font-semibold whitespace-nowrap">
        {left > 0 ? (
          <>
            <span className="text-fire tabular-nums">{left}</span>
            <span className="text-muted font-normal"> {left === 1 ? "voto" : "votos"} sin usar</span>
          </>
        ) : (
          <span className="text-muted font-normal">Sin votos restantes</span>
        )}
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center text-muted py-12 text-sm border border-dashed border-line rounded-[var(--radius-xl)]">
      {label}
    </div>
  );
}
