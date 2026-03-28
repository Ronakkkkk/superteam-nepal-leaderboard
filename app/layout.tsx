import type { Metadata } from "next";
import { Syne, DM_Sans, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Superteam Nepal — Ambassador Leaderboard",
  description:
    "Track XP and contributions of Superteam Nepal ambassadors. Built for the Nepali Web3 community.",
  openGraph: {
    title: "Superteam Nepal — Ambassador Leaderboard",
    description:
      "Track XP and contributions of Superteam Nepal ambassadors. Built for the Nepali Web3 community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${archivo.variable} ${spaceMono.variable}`}
    >
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
