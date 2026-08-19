"use client";

import { ArrowRight, Hand, HelpCircle, Lightbulb, Vote } from "lucide-react";
import { PillButton } from "./ui";
import { MAX_VOTES } from "@/lib/constants";

interface TutorialModalProps {
  onClose: () => void;
}

const steps = [
  {
    icon: Lightbulb,
    title: "Proponer charla",
    body: "¿Tienes algo que compartir? Propón un tema y tú serás quien lo dé.",
    color: "var(--fire)",
    soft: "var(--fire-soft)",
  },
  {
    icon: HelpCircle,
    title: "Pedir charla",
    body: "¿Quieres aprender algo? Sugiere un tema y alguien más puede tomarlo.",
    color: "var(--community)",
    soft: "var(--community-soft)",
  },
  {
    icon: Hand,
    title: "Reclamar un tema",
    body: "¿Ves un tema pedido que dominas? Reclámalo y vuélvete su speaker.",
    color: "var(--community)",
    soft: "var(--community-soft)",
  },
  {
    icon: Vote,
    title: "Votar",
    body: `Cuando abra la votación tienes ${MAX_VOTES} votos. Puedes repartirlos o poner varios en la misma charla. Las más votadas se programan primero.`,
    color: "var(--fire)",
    soft: "var(--fire-soft)",
  },
];

export function TutorialModal({ onClose }: TutorialModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-lg sm:mx-4 bg-surface border border-line
          shadow-[var(--shadow-2xl)] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]
          max-h-[90dvh] flex flex-col"
      >
        <div className="w-10 h-1 bg-line rounded-full mx-auto mt-4 sm:hidden shrink-0" />

        <div className="overflow-y-auto p-5 sm:p-6 flex-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1.5">
            Bienvenido a la unconference 🔥
          </h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Aquí la agenda la armamos entre todos. Así funciona:
          </p>

          <div className="space-y-5">
            {steps.map(({ icon: Icon, title, body, color, soft }) => (
              <div key={title} className="flex gap-3.5">
                <div
                  className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                  style={{ background: soft, color }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 pt-0 shrink-0">
          <PillButton
            variant="fire"
            size="lg"
            onClick={onClose}
            iconRight={<ArrowRight size={20} strokeWidth={1.5} />}
            className="w-full"
          >
            ¡Entendido!
          </PillButton>
        </div>
      </div>
    </div>
  );
}
