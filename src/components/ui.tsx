"use client";

/**
 * Ignia UI primitives — ported from the design system's
 * ui_kits/website/Primitives.jsx.
 *
 * Non-negotiables baked in here:
 *  - CTAs are always pill-shaped
 *  - small/admin buttons use the tight 0.2rem base radius
 *  - the right-arrow translates 4px on group hover
 */

type ButtonVariant = "primary" | "fire" | "outline" | "ghost" | "danger";

const pillVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-[var(--shadow-lg)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-xl)]",
  fire:
    "bg-[image:var(--fire-gradient)] text-white font-bold shadow-[var(--shadow-lg)] hover:-translate-y-0.5 hover:scale-[1.02]",
  outline:
    "border-2 border-primary text-primary hover:bg-surface",
  ghost: "text-muted hover:text-foreground hover:bg-surface-hover",
  danger:
    "bg-destructive-soft text-destructive hover:bg-destructive hover:text-white",
};

const pillSizes = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base sm:text-lg",
} as const;

export function PillButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof pillSizes;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap
        transition-all duration-300 ease-expo cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100
        ${pillSizes[size]} ${pillVariants[variant]} ${className}`}
    >
      {icon && <span className="flex-none">{icon}</span>}
      {children}
      {iconRight && (
        <span className="flex-none transition-transform duration-300 group-hover:translate-x-1">
          {iconRight}
        </span>
      )}
    </button>
  );
}

/** Square-corner button for admin / form chrome — 0.2rem radius. */
export function SquareButton({
  children,
  variant = "secondary",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-[var(--primary-hover)]",
    secondary: "bg-surface text-foreground border border-line hover:bg-surface-hover",
    ghost: "text-muted hover:text-foreground hover:bg-surface-hover",
    danger: "bg-destructive-soft text-destructive hover:bg-destructive hover:text-white",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius)]
        font-medium text-sm transition-colors duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

type PillTone = "default" | "muted" | "fire" | "community" | "live";

export function Pill({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  const tones: Record<PillTone, string> = {
    default: "bg-primary text-on-primary",
    muted: "bg-surface text-foreground border border-line",
    fire: "bg-fire text-white",
    community: "bg-community text-white",
    live: "bg-fire-soft text-fire border border-fire/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px]
        font-semibold shadow-[var(--shadow-sm)] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Uppercase eyebrow label — Space Grotesk, +0.14em tracking. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`eyebrow text-muted ${className}`}>{children}</div>;
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-[linear-gradient(90deg,transparent,var(--border),transparent)] ${className}`}
    />
  );
}

/** Ignia wordmark — the PNG lockup, swapped by theme via CSS. */
export function IgniaLogo({ className = "h-6 w-24" }: { className?: string }) {
  return <div role="img" aria-label="Ignia" className={`ignia-logo ${className}`} />;
}
