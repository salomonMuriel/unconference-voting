"use client";

import { Flame, Hand, Mic, Minus, Plus } from "lucide-react";
import { PillButton } from "./ui";

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
}

interface TopicCardProps {
  topic: Topic;
  phase: "submission" | "voting";
  currentUserId: string;
  /** How many of the current user's votes sit on this topic. */
  myVotes: number;
  /** Whether the user still has votes left to spend. */
  canAddVote: boolean;
  /** Highest vote_count on the board — scales the fill bar. */
  topVotes: number;
  onClaim: () => void;
  onVote: (delta: 1 | -1) => void;
}

export function TopicCard({
  topic,
  phase,
  currentUserId,
  myVotes,
  canAddVote,
  topVotes,
  onClaim,
  onVote,
}: TopicCardProps) {
  if (phase === "voting") {
    // The bar is the at-a-glance signal; the number is the precise one.
    const fill = topVotes > 0 ? Math.round((topic.vote_count / topVotes) * 100) : 0;
    const isLeader = topic.vote_count > 0 && topic.vote_count === topVotes;
    const accent = isLeader ? "var(--fire)" : "var(--primary)";

    return (
      <div
        className={`ignia-card flex flex-col p-4 sm:p-5 h-full ${
          myVotes > 0 ? "ring-2 ring-fire/40" : ""
        }`}
        style={{ "--accent-line": accent } as React.CSSProperties}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-lg sm:text-xl leading-snug">
              {topic.title}
            </h3>
            <p className="text-muted text-sm mt-1.5 inline-flex items-center gap-1.5">
              <Mic size={15} strokeWidth={1.5} className="shrink-0" />
              <span className="text-foreground font-medium">{topic.speaker_name}</span>
            </p>
          </div>

          {/* Vote total — the loudest thing on the card. */}
          <div className="flex flex-col items-center shrink-0 leading-none">
            <span
              className={`font-display text-4xl sm:text-5xl font-bold tabular-nums ${
                isLeader ? "text-fire" : "text-foreground"
              }`}
            >
              {topic.vote_count}
            </span>
            <span className="eyebrow text-muted mt-1 text-[10px]">
              {topic.vote_count === 1 ? "voto" : "votos"}
            </span>
          </div>
        </div>

        {topic.description && (
          <p className="text-muted text-sm mt-2 line-clamp-2">{topic.description}</p>
        )}

        {/* Fill bar — relative standing without moving the card. */}
        <div className="mt-auto pt-4">
          <div className="h-2 rounded-full bg-[var(--background)] border border-line overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-expo"
              style={{
                width: `${fill}%`,
                background: isLeader ? "var(--fire-gradient)" : "var(--primary)",
              }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            {myVotes > 0 ? (
              <>
                {Array.from({ length: myVotes }).map((_, i) => (
                  <Flame key={i} size={18} strokeWidth={1.5} className="text-fire fill-fire/20" />
                ))}
                <span className="text-sm text-muted truncate">tuyos</span>
              </>
            ) : (
              <span className="text-sm text-muted truncate">Sin votos tuyos</span>
            )}
          </div>

          {/* 48px minimum touch targets. */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onVote(-1)}
              disabled={myVotes === 0}
              aria-label={`Quitar un voto de ${topic.title}`}
              className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center
                border border-line text-muted transition-colors duration-200 cursor-pointer
                hover:border-destructive hover:text-destructive
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-line
                disabled:hover:text-muted"
            >
              <Minus size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => onVote(1)}
              disabled={!canAddVote}
              aria-label={`Votar por ${topic.title}`}
              className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center
                transition-all duration-300 ease-expo cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none ${
                  myVotes > 0
                    ? "bg-fire text-white shadow-[var(--glow-fire)]"
                    : "bg-primary text-on-primary hover:opacity-90"
                }`}
            >
              <Plus size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submission phase — orphan topics carry the fire accent, claimed ones the community teal.
  const accent = topic.type === "orphan" ? "var(--fire)" : "var(--community)";

  return (
    <div
      className="ignia-card p-3 sm:p-4"
      style={{ "--accent-line": accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-base sm:text-xl leading-snug">{topic.title}</h3>
          {topic.description && (
            <p className="text-muted text-sm sm:text-base mt-1">{topic.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted">
            <span>
              por <span className="text-foreground font-medium">{topic.proposed_by_name}</span>
            </span>
            {topic.speaker_name && topic.type === "speaker_led" && (
              <span className="inline-flex items-center gap-1.5 text-community">
                <Mic size={15} strokeWidth={1.5} />
                <span className="font-medium">{topic.speaker_name}</span>
              </span>
            )}
          </div>
        </div>

        {topic.type === "orphan" && topic.proposed_by !== currentUserId && (
          <PillButton
            variant="outline"
            size="sm"
            onClick={onClaim}
            icon={<Hand size={16} strokeWidth={1.5} />}
            className="shrink-0 min-h-[44px]"
          >
            ¡La doy yo!
          </PillButton>
        )}
      </div>
    </div>
  );
}
