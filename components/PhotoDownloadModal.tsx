"use client";

import { useEffect, useState } from "react";

export type DownloadAlbum = {
  date: string;
  venue: string;
  url: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  albums: DownloadAlbum[];
};

export default function PhotoDownloadModal({ open, onClose, albums }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  // ESC + blocco scroll pagina
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setIsClosing(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Wrapper glow (NO overflow-hidden) */}
        <div
          className={[
            "relative w-full max-w-2xl rounded-3xl tsw-photo-glow",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card */}
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl">
            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Chiudi ✕
            </button>

            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Download foto eventi
              </h3>

              {/* ✅ SCROLL INTERNO PER TANTI LINK */}
              <div className="mt-5 max-h-[55vh] overflow-y-auto pr-2 tsw-thin-scroll">
                <div className="grid gap-3">
                  {albums.map((a) => (
                    <a
                      key={`${a.date}-${a.venue}`}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"

                    >
                      <div className="text-sm text-zinc-400">{a.date}</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {a.venue}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glow + Animazioni + Scrollbar */}
          <style jsx global>{`
            .tsw-photo-glow::before {
              content: "";
              position: absolute;
              inset: -3px;
              border-radius: 26px;
              pointer-events: none;
              background: radial-gradient(
                120% 120% at 50% 0%,
                rgba(255, 255, 255, 0.85) 0%,
                rgba(255, 255, 255, 0.25) 35%,
                transparent 70%
              );
              opacity: 0.25;
              filter: blur(16px);
            }

            .tsw-photo-glow::after {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: 24px;
              pointer-events: none;
              box-shadow:
                0 0 0 1px rgba(255, 255, 255, 0.14) inset,
                0 0 16px rgba(255, 255, 255, 0.24),
                0 0 34px rgba(255, 255, 255, 0.16);
              opacity: 0.6;
            }

            .tsw-modal-in {
              animation: tswModalIn 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
              transform-origin: 50% 45%;
            }
            .tsw-modal-out {
              animation: tswModalOut 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
              transform-origin: 50% 45%;
            }
            .tsw-backdrop-in {
              animation: tswBackdropIn 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .tsw-backdrop-out {
              animation: tswBackdropOut 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            @keyframes tswModalIn {
              from {
                opacity: 0;
                transform: translateY(14px) scale(0.98);
                filter: blur(6px);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0px);
              }
            }
            @keyframes tswModalOut {
              from {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0px);
              }
              to {
                opacity: 0;
                transform: translateY(18px) scale(0.975);
                filter: blur(10px);
              }
            }
            @keyframes tswBackdropIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes tswBackdropOut {
              from {
                opacity: 1;
              }
              to {
                opacity: 0;
              }
            }

            /* Scrollbar sottile */
            .tsw-thin-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
            }
            .tsw-thin-scroll::-webkit-scrollbar {
              width: 10px;
            }
            .tsw-thin-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .tsw-thin-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.16);
              border-radius: 999px;
              border: 3px solid transparent;
              background-clip: content-box;
            }
            .tsw-thin-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.28);
              border: 3px solid transparent;
              background-clip: content-box;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
