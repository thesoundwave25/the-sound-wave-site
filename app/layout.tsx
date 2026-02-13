import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";


export const metadata: Metadata = {
  title: "The Sound Wave",
  description: "The Sound Wave website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
      

        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
