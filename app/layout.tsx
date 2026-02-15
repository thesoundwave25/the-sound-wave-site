"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 1. Impedisce al browser di ricordare la vecchia posizione dello scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 2. Forza lo scroll in cima in modo istantaneo al caricamento
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <html lang="it">
      <head>
        <title>The Sound Wave | Duo DJ e Vocalist</title>
        <meta name="description" content="Sito ufficiale di The Sound Wave. Scopri la nostra musica, i remix e i prossimi eventi live. Disponibili per club, eventi privati e festival." />
        
        {/* --- INIZIO SEZIONE ICONE --- */}
        {/* Favicon standard per browser e Google */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        
        {/* Icona per dispositivi Apple (iPhone/iPad) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest per Android e Web App */}
        <link rel="manifest" href="/site.webmanifest" />
        {/* --- FINE SEZIONE ICONE --- */}
      </head>
      <body className="min-h-screen overflow-x-clip">
  {children}
  <Analytics />
</body>

    </html>
  );
}