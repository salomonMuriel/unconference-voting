"use client";

import { useState } from "react";
import { ArrowRight, HelpCircle, Lightbulb } from "lucide-react";
import { PillButton, SquareButton } from "./ui";

interface NewTopicModalProps {
  type: "pitch" | "request";
  onClose: () => void;
  onSubmit: (title: string, description: string, type: "speaker_led" | "orphan") => void;
}

export function NewTopicModal({ type, onClose, onSubmit }: NewTopicModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isPitch = type === "pitch";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, description, isPitch ? "speaker_led" : "orphan");
  }

  const inputClass = `w-full px-4 py-3 rounded-[var(--radius)] bg-background border border-input-line
    text-base placeholder:text-muted transition-[border-color,box-shadow] duration-200
    focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-soft)]`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm" onClick={onClose} />

      {/* Slides up from the bottom on mobile, centered on desktop. */}
      <div
        className="relative w-full sm:max-w-lg sm:mx-4 p-5 sm:p-6 bg-surface border border-line
          shadow-[var(--shadow-2xl)] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]"
      >
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5 sm:hidden" />

        <div
          className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center mb-4"
          style={{
            background: isPitch ? "var(--fire-soft)" : "var(--community-soft)",
            color: isPitch ? "var(--fire)" : "var(--community)",
          }}
        >
          {isPitch ? (
            <Lightbulb size={22} strokeWidth={1.5} />
          ) : (
            <HelpCircle size={22} strokeWidth={1.5} />
          )}
        </div>

        <h2 className="font-display text-2xl font-bold mb-1.5">
          {isPitch ? "Proponer charla" : "Pedir charla"}
        </h2>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          {isPitch
            ? "Cuenta qué sabes hacer. Tú serás quien la dé."
            : "Sugiere un tema que quieras aprender — alguien de la comunidad puede tomarlo."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic-title" className="block text-sm font-medium mb-1.5">
              Título
            </label>
            <input
              id="topic-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isPitch ? "¿De qué vas a hablar?" : "¿Qué te gustaría aprender?"}
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="topic-desc" className="block text-sm font-medium mb-1.5">
              Descripción <span className="text-muted font-normal">(opcional)</span>
            </label>
            <textarea
              id="topic-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos en una frase de qué se trata…"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <SquareButton
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto py-3 sm:py-2.5"
            >
              Cancelar
            </SquareButton>
            <PillButton
              type="submit"
              variant={isPitch ? "fire" : "primary"}
              disabled={!title.trim()}
              iconRight={<ArrowRight size={18} strokeWidth={1.5} />}
              className="w-full sm:w-auto"
            >
              {isPitch ? "¡Proponerla!" : "¡Pedirla!"}
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
