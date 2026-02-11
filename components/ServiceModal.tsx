"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export type ServiceItem = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;

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

  // ✅ Detect mobile (solo per abilitare drag Apple-style)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // ✅ Drag state (Apple-style)
  const [dragY, setDragY] = useState(0); // negativo = verso l'alto
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);

  // Touch start coords
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      // reset drag per sicurezza
      setDragY(0);
      setDragging(false);
      setSnapBack(false);
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

  // Reset closing + drag se cambia servizio
  useEffect(() => {
    if (!open) return;
    setIsClosing(false);
    setDragY(0);
    setDragging(false);
    setSnapBack(false);
  }, [open, service?.id]);

  if (!open || !service) return null;

  // progress 0..1 (quanto hai trascinato verso l'alto)
  const progress = useMemo(() => {
    const p = Math.min(1, Math.max(0, Math.abs(dragY) / 220));
    return p;
  }, [dragY]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return; // ✅ desktop invariato
    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    setDragging(true);
    setSnapBack(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (!dragging) return;
    if (touchStartY === null || touchStartX === null) return;

    const t = e.touches[0];
    const endY = t.clientY;
    const endX = t.clientX;

    const deltaY = endY - touchStartY; // negativo = swipe up
    const deltaX = Math.abs(endX - touchStartX);

    // Se si muove troppo in orizzontale, non trasciniamo (evita false positives)
    if (deltaX > 80) return;

    // Vogliamo solo swipe UP: quindi clamp a [ -260 .. 0 ]
    const clamped = Math.max(-260, Math.min(0, deltaY));
    setDragY(clamped);
  };

  const onTouchEnd = () => {
    if (!isMobile) return;
    if (!dragging) return;

    const SWIPE_UP_THRESHOLD = 140;

    // se superi soglia -> chiudi
    if (dragY < -SWIPE_UP_THRESHOLD) {
      requestClose();
    } else {
      // altrimenti torna su “morbido”
      setSnapBack(true);
      setDragY(0);
      window.setTimeout(() => setSnapBack(false), 260);
    }

    setDragging(false);
    setTouchStartY(null);
    setTouchStartX(null);
  };

  // ✅ Applichiamo transform SOLO su mobile
  const mobileDragStyle: React.CSSProperties = isMobile
    ? {
        transform: `translateY(${dragY}px) scale(${1 - progress * 0.01})`,
      }
    : {};

  // ✅ Backdrop: mentre trascini diventa meno intenso (Apple-ish)
  const backdropOpacityStyle: React.CSSProperties = isMobile
    ? {
        opacity: 1 - progress * 0.25,
      }
    : {};

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        style={backdropOpacityStyle}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-4">
        <div
          role="dialog"
          aria-modal="true"
          // ✅ DESKTOP: identico
          className={[
            "relative w-full max-w-3xl overflow-hidden border border-white/10",
            "rounded-3xl",
            // ✅ MOBILE: più alto (senza scroll interno), DESKTOP invariato
            "max-h-[92svh] md:max-h-none",
            "bg-zinc-950/80 shadow-2xl",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
            // ✅ transizione “snap back” solo mobile
            snapBack ? "tsw-drag-snap" : "",
          ].join(" ")}
          style={mobileDragStyle}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close */}
          <button
            onClick={requestClose}
            className={[
              "absolute right-4 top-4 z-10 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-100",
              // mobile: più visibile
              "bg-black/80 hover:bg-black/90",
              // desktop (md+): identico a prima
              "md:bg-white/5 md:hover:bg-white/10",
              "backdrop-blur",
            ].join(" ")}
          >
            Chiudi ✕
          </button>

          {/* Drag handle (solo mobile) */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>

          {/* Media */}
          <div className="relative aspect-[16/9] md:aspect-video w-full bg-black/40">
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

          {/* Content (no scroll) */}
          <div className="p-6 sm:p-8 overflow-hidden">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-300">{service.desc}</p>

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

      {/* Animazioni IN/OUT + snap back */}
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

        /* ✅ “snap back” (solo quando rilasci e non superi soglia) */
        .tsw-drag-snap {
          transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
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
