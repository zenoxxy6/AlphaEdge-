import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaEdge",
  description: "Market analysis and risk-management workspace"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}