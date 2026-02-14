"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export type FormatTrack = { title: string; src: string };
export type FormatItem = {
  id: string;
  title: string;
  logoSrc: string;
  tracks?: FormatTrack[]; // lasciato per compatibilità col page (non usato qui)
};

type Props = { open: boolean; onClose: () => void; format: FormatItem | null };

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}

// Mobile detection “soft”
function isMobileSoft() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;
}

// ✅ Contenuti popup gestiti QUI (page invariato)
const FORMAT_DETAILS: Record<string, { description: string; linkHref: string }> =
  {
    emotion: {
      description:
        "Una mini-selezione firmata The Sound Wave, per raccontare l’energia e i generi di EMOTION Official Party 90/2000.",
      linkHref:
        "https://www.youtube.com/playlist?list=PLJNHrR97zbO_fb7R-hM5joDbDwSqKg9cX",
    },
    "italian-remix-party": {
      description:
        "Solo musica italiana remixata: dalle hit che cantano tutti ai classici intramontabili, trasformati in versioni dance ad altissima energia. Ritornelli a squarciagola, drop che spingono e un’unica regola: non stare fermo.",
      linkHref:
        "https://www.youtube.com/playlist?list=PLJNHrR97zbO9bmZ_hqh1T9Sk1yOiRmuPy",
    },
    "the-ritual": {
      description:
        "Afro House e Tribal House,Percussioni ipnotiche, groove tribali e una crescita continua che porta la pista in uno stato di trance elegante, intensa, rituale. Se cerchi un’atmosfera che si sente nello stomaco e si balla fino all’alba… benvenuto nel rito. ",
      linkHref:
        "https://www.youtube.com/playlist?list=PLJNHrR97zbO-eNm7xdngZcA7zRYjPPVMH",
    },
  };

export default function FormatModal({ open, onClose, format }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // ✅ MOBILE ONLY (per swipe apple)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsMobile(window.innerWidth < 768); // md
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ✅ Apple swipe (solo mobile)
  const [dragY, setDragY] = useState(0); // negativo = verso l’alto
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Theme (identico al tuo, ma senza ledBar/ledGlow perché erano usati dal player)
  const theme = useMemo(() => {
    const id = format?.id ?? "";
    if (id === "emotion") {
      const glow = "rgba(255, 0, 0, 0.85)";
      return {
        glowL: glow,
        glowC: glow,
        glowR: glow,
      };
    }
    if (id === "italian-remix-party") {
      return {
        glowL: "rgba(0,166,80,0.65)",
        glowC: "rgba(255,255,255,0.70)",
        glowR: "rgba(224,0,42,0.65)",
      };
    }
    return {
      glowL: "rgba(124,58,237,0.60)",
      glowC: "rgba(245,158,11,0.70)",
      glowR: "rgba(249,115,22,0.60)",
    };
  }, [format?.id]);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);

      // reset drag (mobile)
      setDragY(0);
      setDragging(false);
      setSnapBack(false);

      onClose();
    }, 340);
  };

  // ESC + lock scroll
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

  // Open/reset
  useEffect(() => {
    if (!open || !format) return;

    setIsClosing(false);

    // reset drag (mobile)
    setDragY(0);
    setDragging(false);
    setSnapBack(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, format?.id]);

  // ✅ Apple swipe handlers (ora su tutta la card - mobile)
  const onHandleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    setDragging(true);
    setSnapBack(false);
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (!dragging) return;
    if (touchStartY === null || touchStartX === null) return;

    const t = e.touches[0];
    const deltaY = t.clientY - touchStartY; // negativo = swipe up
    const deltaX = Math.abs(t.clientX - touchStartX);

    // evita gesti laterali
    if (deltaX > 80) return;

    // solo swipe UP
    const clamped = Math.max(-260, Math.min(0, deltaY));
    setDragY(clamped);
  };

  const onHandleTouchEnd = () => {
    if (!isMobile) return;
    if (!dragging) return;

    const TH = 140;

    if (dragY < -TH) {
      requestClose();
    } else {
      setSnapBack(true);
      setDragY(0);
      window.setTimeout(() => setSnapBack(false), 260);
    }

    setDragging(false);
    setTouchStartY(null);
    setTouchStartX(null);
  };

  if (!open || !format) return null;

  const progress = Math.min(1, Math.max(0, Math.abs(dragY) / 220));

  const draggableStyle: React.CSSProperties = isMobile
    ? { transform: `translateY(${dragY}px) scale(${1 - progress * 0.01})` }
    : {};

  const backdropStyle: React.CSSProperties = isMobile
    ? { opacity: 1 - progress * 0.25 }
    : {};

  const details = FORMAT_DETAILS[format.id];

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        style={backdropStyle}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* ✅ DRAG WRAPPER (solo mobile) — desktop invariato */}
        <div
          className={[
            "touch-none md:touch-auto",
            snapBack ? "tsw-drag-snap" : "",
          ].join(" ")}
          style={draggableStyle}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={[
              "relative w-full overflow-hidden rounded-3xl border border-white/10",
              "bg-zinc-950/80 shadow-2xl",
              "tsw-shell",
              // ✅ MOD: più larga
              "max-w-5xl",
              // ✅ MOBILE: più alto senza toccare desktop
              "max-h-[92svh] md:max-h-none",
              isClosing ? "tsw-modal-out" : "tsw-modal-in",
            ].join(" ")}
            style={
              {
                ["--glowL" as any]: theme.glowL,
                ["--glowC" as any]: theme.glowC,
                ["--glowR" as any]: theme.glowR,
              } as React.CSSProperties
            }
            onClick={(e) => e.stopPropagation()}
            // ✅ SWIPE SU TUTTA LA CARD (mobile)
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
          >
            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Chiudi ✕
            </button>

            {/* ✅ SWIPE ZONE (SOLO MOBILE): BARRETTA + LOGO + TITOLO (ora solo visiva) */}
            <div className="md:hidden touch-none">
              {/* Barretta (hint) */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>

              {/* Logo */}
              <div className="relative w-full bg-black/40">
                <div className="relative h-[220px] w-full">
                  <Image
                    src={format.logoSrc}
                    alt={format.title}
                    fill
                    className="object-contain object-center p-10"
                    priority
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              </div>

              {/* Titolo (mobile) */}
              <h3 className="px-6 py-4 text-2xl font-semibold tracking-tight text-zinc-100 text-center">
                {format.title}
              </h3>
            </div>

            {/* ✅ DESKTOP: drag handle identico (solo visivo) */}
            <div className="hidden md:flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            {/* ✅ DESKTOP: logo identico */}
            <div className="hidden md:block relative w-full bg-black/40">
              <div className="relative h-[220px] sm:h-[320px] w-full">
                <Image
                  src={format.logoSrc}
                  alt={format.title}
                  fill
                  className="object-contain object-center p-10"
                  priority
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            </div>

            <div className="p-6 sm:p-8">
              {/* ✅ Titolo SOLO desktop (mobile è già sopra nella swipe zone) */}
              <h3 className="hidden md:block text-2xl font-semibold tracking-tight text-zinc-100 text-center mx-auto">
                {format.title}
              </h3>

              <div className="hidden md:block mt-5" />

              {/* ✅ DESCRIZIONE + LINK centrati (al posto del player) */}
              {details ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-200">
                    {details.description}
                  </p>

                  <div className="mt-4">
                    <a
                      href={details.linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className="tsw-glow-btn inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-100 active:scale-[0.99]"
                      // ✅ ESCLUSO dallo swipe: blocca i touch events verso il parent
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    >
                      Ascolta su YouTube
                      <span className="ml-2 text-zinc-200">↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
                    Dettagli in arrivo.
                  </p>
                </div>
              )}
            </div>

            <style jsx global>{`
              .tsw-shell {
                position: relative;
              }
              .tsw-shell::before {
                content: "";
                position: absolute;
                inset: -2px;
                border-radius: 24px;
                pointer-events: none;
                background: radial-gradient(
                    120% 130% at 0% 0%,
                    var(--glowL) 0%,
                    transparent 62%
                  ),
                  radial-gradient(
                    150% 140% at 50% 0%,
                    var(--glowC) 0%,
                    transparent 64%
                  ),
                  radial-gradient(
                    120% 130% at 100% 0%,
                    var(--glowR) 0%,
                    transparent 62%
                  );
                opacity: 0.55;
                filter: blur(14px);
              }
              .tsw-shell::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: 24px;
                pointer-events: none;
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                  0 0 26px var(--glowC), 0 0 34px var(--glowL),
                  0 0 34px var(--glowR);
                opacity: 0.38;
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

              /* ✅ snap-back (solo mobile wrapper) */
              .tsw-drag-snap {
                transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
              }

              /* ✅ bottone cliccabile con glow bianco */
              .tsw-glow-btn {
                transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  background 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  border-color 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1);
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.22) inset,
                  0 0 14px rgba(255, 255, 255, 0.25);
              }
              .tsw-glow-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.35);
                transform: translateY(-1px);
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.28) inset,
                  0 0 22px rgba(255, 255, 255, 0.38),
                  0 0 44px rgba(255, 255, 255, 0.14);
              }
              .tsw-glow-btn:active {
                transform: translateY(0px) scale(0.99);
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
        </div>
      </div>
    </div>
  );
}
