import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUAL Wine Vault | Tokenised Wine Platform",
  description: "Tokenised fine wine investment, collection, and provenance on the DUAL network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
