import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FizouTV | L'actualité en continu",
  description: "FizouTV : Votre média d'information indépendant. Politique, Économie, Société et plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased selection:bg-fizou-red selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
