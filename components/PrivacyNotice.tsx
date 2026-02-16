"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tsw_privacy_notice_v1";

export default function PrivacyNotice() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // se localStorage non è disponibile, mostriamo comunque
      setOpen(true);
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  // 🔒 Importantissimo per evitare hydration mismatch
  if (!mounted || !open) return null;

  return (
    <div
      className={[
        "fixed inset-x-0 bottom-0 z-[2147483647]",
        "p-3 sm:p-4",
        "pb-[calc(env(safe-area-inset-bottom,0px)+12px)]",
      ].join(" ")}
      role="region"
      aria-label="Informativa privacy"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={[
            "relative overflow-hidden rounded-2xl",
            "border border-white/12 bg-black/70 backdrop-blur",
            "shadow-[0_18px_70px_rgba(0,0,0,0.55)]",
          ].join(" ")}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl bg-white/10" />
            <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full blur-3xl bg-white/5" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative z-10 flex flex-col gap-3 p-4 sm:p-5">
            <div className="text-sm sm:text-[15px] text-zinc-200 leading-relaxed">
              Questo sito usa solo cookie{" "}
              <span className="text-white font-semibold">tecnici</span> e statistiche{" "}
              <span className="text-white font-semibold">aggregate</span> (senza profilazione).
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="/privacy"
                  className="text-zinc-200 hover:text-white transition underline underline-offset-4"
                >
                  Privacy
                </a>
                <a
                  href="/cookie"
                  className="text-zinc-200 hover:text-white transition underline underline-offset-4"
                >
                  Cookie
                </a>
              </div>

              <button
                type="button"
                onClick={close}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-xl bg-white px-4 py-2",
                  "text-sm font-semibold text-black",
                  "transition active:scale-[0.99]",
                  "w-full sm:w-auto",
                ].join(" ")}
                aria-label="Chiudi informativa"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
