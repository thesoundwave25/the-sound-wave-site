"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type ServiceItem = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;

  // ✅ aggiunti per Social PR / Fotografo
  igUrl?: string;
  websiteUrl?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  service: ServiceItem | null;
};

export default function ServiceModal({ open, onClose, service }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // Chiudi con animazione (cinema)
  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  // ESC + blocco scroll body (quando è aperto)
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

  // Reset closing se cambia servizio (es. click veloce su un'altra card)
  useEffect(() => {
    if (open) setIsClosing(false);
  }, [open, service?.id]);

  if (!open || !service) return null;

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

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10",
            "bg-zinc-950/80 shadow-2xl",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={requestClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
          >
            Chiudi ✕
          </button>

          {/* Media */}
          <div className="relative aspect-video w-full bg-black/40">
            {service.mediaType === "video" && service.mediaSrc ? (
              <video
                className="h-full w-full object-cover"
                src={service.mediaSrc}
                controls
                playsInline
              />
            ) : service.mediaSrc ? (
              <Image
                src={service.mediaSrc}
                alt={service.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                Media (immagine/video) qui
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-300">{service.desc}</p>

            {/* ✅ Link sotto descrizione (solo se presenti) */}
            {(service.igUrl || service.websiteUrl) && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {service.igUrl && (
                  <a
                    href={service.igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
                  >
                    <Image
                      src="/brand/ig-icon.png"
                      alt="Instagram"
                      width={18}
                      height={18}
                      className="opacity-90"
                    />
                    <span>Instagram</span>
                  </a>
                )}

                {service.websiteUrl && (
                  <a
                    href={service.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
                  >
                    <span className="text-zinc-300">🌐</span>
                    <span>Sito web</span>
                  </a>
                )}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-200">
              <p className="text-sm leading-relaxed">{service.detail}</p>
            </div>

            {/* ✅ tolto "Contattaci" (rimane solo chiusura) */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={requestClose}
                className="inline-flex w-fit items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
              >
                Torna ai servizi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animazioni IN/OUT (cinema) */}
      <style jsx global>{`
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
          animation: tswBackdropOut 0.34s cubic-bezier(0.22, 1, 0.36, 1)
            both;
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
      `}</style>
    </div>
  );
}
