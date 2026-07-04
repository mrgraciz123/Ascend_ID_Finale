import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
 variable: "--font-sans",
 subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
 variable: "--font-mono",
 subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
 variable: "--font-display",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "AscendID - Trust Layer for Talent",
 description: "Verified digital identity and opportunity platform for students and recruiters.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className="dark">
  <body
    className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased min-h-screen bg-background text-foreground`}
  >
 <AuthProvider>
 {children}
 </AuthProvider>
 </body>
 </html>
 );
}
