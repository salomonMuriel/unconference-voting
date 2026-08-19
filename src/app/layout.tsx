import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Ignia self-hosts both families — keeps the board working on venue wifi.
const geist = localFont({
  src: "../../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "../../public/fonts/SpaceGrotesk-VariableFont_wght.ttf",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unconference · Ignia",
  description: "Propón, pide y vota las charlas de la unconference. 0% relleno.",
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/web-app-manifest-512x512.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${geist.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
