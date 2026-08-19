"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Smartphone } from "lucide-react";
import { PillButton, Eyebrow, IgniaLogo } from "@/components/ui";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo ingresar");
        return;
      }

      localStorage.setItem("show_tutorial", "1");
      router.push("/board");
    } catch {
      setError("Algo salió mal, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blurred fire blob — decorative, always behind content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full
          bg-fire opacity-[0.10] blur-3xl"
      />

      <div className="w-full max-w-md relative hero-fade-up">
        <div className="text-center mb-10">
          <IgniaLogo className="h-7 w-28 mx-auto mb-8 [background-position:center]" />

          <Eyebrow className="mb-4">Unconference</Eyebrow>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-[1.1]">
            Hoy la agenda <br className="hidden sm:block" />
            la haces <span className="text-gradient-fire">tú</span>
          </h1>

          <p className="text-muted text-base sm:text-lg leading-relaxed">
            Entra con tu nombre, di qué quieres enseñar o aprender, y vota lo que te mueve. 0% relleno 🔥
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              ¿Cómo te llamas?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              autoFocus
              className="w-full px-4 py-3.5 rounded-[var(--radius)] bg-background border border-input-line
                text-base placeholder:text-muted transition-[border-color,box-shadow] duration-200
                focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-soft)]"
            />
          </div>

          {error && <p className="text-destructive text-sm px-1">{error}</p>}

          <PillButton
            type="submit"
            variant="fire"
            size="lg"
            disabled={loading || !name.trim()}
            iconRight={<ArrowRight size={20} strokeWidth={1.5} />}
            className="w-full"
          >
            {loading ? "Entrando…" : "Entrar"}
          </PillButton>
        </form>

        {/* QR: only useful on desktop, where the user isn't already on their phone. */}
        <div className="hidden sm:flex mt-12 flex-col items-center gap-3">
          <div className="p-3 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
            <QRCodeSVG value="https://com-builders.vercel.app" size={160} level="M" />
          </div>
          <p className="text-muted text-sm inline-flex items-center gap-2">
            <Smartphone size={16} strokeWidth={1.5} />
            Escanea para unirte desde tu celular
          </p>
        </div>
      </div>
    </div>
  );
}
