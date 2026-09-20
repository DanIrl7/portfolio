import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono, Fraunces } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Daniel Masona — Fullstack Developer",
  description:
    "Portfolio of Daniel Masona — frontend-leaning fullstack developer. DoggDenn, pianoVue, and nyxx.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
