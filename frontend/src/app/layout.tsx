import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import WakeBanner from "@/components/WakeBanner";

const display = Unbounded({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "900"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Grip Guild — Tools, Customers & Status for India's Mechanics",
  description:
    "Grip Guild turns two-wheeler mechanics and puncture shops into measurable brand advocates — with tools, customers and status instead of cash.",
};

export const viewport: Viewport = { themeColor: "#07080A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain font-sans">
        <WakeBanner />
        {children}
      </body>
    </html>
  );
}
