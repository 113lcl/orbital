import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORBITAL/26 — Digital Gravity",
  description: "Independent creative lab shaping digital worlds with gravity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
