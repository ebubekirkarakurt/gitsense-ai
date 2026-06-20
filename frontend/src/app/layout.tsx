import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitSense",
  description: "AI powered commit message generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}