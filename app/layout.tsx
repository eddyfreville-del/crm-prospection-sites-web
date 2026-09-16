import type { Metadata } from "next";
import { IdentityProvider } from "@/lib/identity";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM — Prospection Sites Web",
  description: "Gestion de la prospection pour la création de sites web.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="font-sans antialiased">
        <IdentityProvider>{children}</IdentityProvider>
      </body>
    </html>
  );
}
