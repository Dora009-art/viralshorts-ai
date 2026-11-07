import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViralShorts AI - Paste Link, Get Viral Shorts",
  description: "Turn one long YouTube video into viral 9:16 shorts automatically with AI hook detection and 1-click auto-posting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.className} bg-[#08090d] text-white antialiased min-h-screen selection:bg-purple-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
