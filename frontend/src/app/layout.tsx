import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitSense",
  description: "AI-powered git commit analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}