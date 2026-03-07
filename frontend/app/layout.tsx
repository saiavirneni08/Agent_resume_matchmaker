import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Agent",
  description: "Match resume skills against job descriptions"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
