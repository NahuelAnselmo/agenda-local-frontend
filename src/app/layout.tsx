import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Norte Studio | Barbería en Palermo",
    template: "%s | Norte Studio",
  },
  description:
    "Reservá online tu próximo corte, barba o servicio de color en Norte Studio, Palermo.",
  keywords: ["barbería", "turnos online", "Palermo", "corte", "barba"],
  openGraph: {
    title: "Norte Studio",
    description: "Tu estilo, tu momento. Reservá tu turno online.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
