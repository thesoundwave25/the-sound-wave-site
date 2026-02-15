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
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // forza top “istantaneo” anche se html ha scroll-behavior: smooth
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  const toTop = () => window.scrollTo(0, 0);
  toTop();
  requestAnimationFrame(toTop);
  setTimeout(toTop, 50);

  // ripristina scroll-behavior
  setTimeout(() => {
    html.style.scrollBehavior = prev;
  }, 0);
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
      <body>
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}