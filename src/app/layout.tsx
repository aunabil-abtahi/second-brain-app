import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Brain } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Second Brain Curator",
  description: "Autonomous AI research web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="layout-header glass">
          <div className="container layout-header-content">
            <a href="/" className="layout-logo">
              <Brain className="lucide-icon" size={28} color="var(--accent)" />
              Second Brain Curator
            </a>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
