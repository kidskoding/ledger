import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LEDGER",
  description:
    "Counts the verification work AI created and no dashboard records.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
        {children}
      </body>
    </html>
  );
}
