"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Nota: I metadata devono stare in un file separato se il layout è "use client"
// Ma per ora li lasciamo qui per semplicità, se Next.js ti dà errore, 
// spostali in un file chiamato 'metadata.ts' o rimuovi "use client" e crea un componente separato.

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
        <meta name="description" content="Sito ufficiale di The Sound Wave. Scopri la nostra musica, i remix e i prossimi eventi live." />
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