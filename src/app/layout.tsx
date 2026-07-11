import type { Metadata } from "next";
import { Newsreader, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | stateOS",
    default: "stateOS — State Engineering Platform",
  },
  description: "Track internal state, diagnose drift, and intervene in real time. Optimize your recovery window.",
  keywords: ["vagal tone", "polyvagal", "HRV", "nervous system regulation", "state audit", "recovery window"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper selection:bg-signal selection:text-ink">
        {children}
      </body>
    </html>
  );
}
