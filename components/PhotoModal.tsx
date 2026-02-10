"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type PhotoItem = {
  id: string;
  src: string;
  alt?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  photo: PhotoItem | null;
  photos?: PhotoItem[];
};

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches; // < md
}

export default function PhotoModal({ open, onClose, photo, photos }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  const safePhotos = useMemo(
    () => (Array.isArray(photos) ? photos : []),
    [photos]
  );

  const [index, setIndex] = useState(0);
  const canNavigate = safePhotos.length > 1;

  const [isMobile, setIsMobile] = useState(false);

  // ✅ Track ref (Apple-like scroll on mobile)
  const trackRef = useRef<HTMLDivElement | null>(null);

  const currentPhoto: PhotoItem | null = useMemo(() => {
    if (safePhotos.length > 0) return safePhotos[index] ?? safePhotos[0] ?? null;
    return photo ?? null;
  }, [safePhotos, index, photo]);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  const goPrev = () => {
    if (!canNavigate) return;
    setIndex((i) => (i - 1 + safePhotos.length) % safePhotos.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setIndex((i) => (i + 1) % safePhotos.length);
  };

  // ✅ mobile watcher
  useEffect(() => {
    const update = () => setIsMobile(isMobileViewport());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Quando apro il modal: set index dalla foto cliccata
  useEffect(() => {
    if (!open) return;
    setIsClosing(false);

    if (safePhotos.length > 0 && photo) {
      const found = safePhotos.findIndex((p) => p.id === photo.id);
      setIndex(found >= 0 ? found : 0);
    } else {
      setIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photo?.id, safePhotos.length]);

  // ✅ quando cambia index: scroll alla slide corretta (solo mobile)
  useEffect(() => {
    if (!open || !isMobile || !canNavigate) return;
    const el = trackRef.current;
    if (!el) return;

    const child = el.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [open, isMobile, canNavigate, index]);

  // ✅ ESC + body lock (iOS safe) + arrows desktop
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (!isMobile && canNavigate) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // iOS-safe lock: position fixed
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    if (isMobile) {
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;

      if (isMobile) {
        const y = Math.abs(parseInt(body.style.top || "0", 10)) || scrollY;
        window.scrollTo(0, y);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile, canNavigate, safePhotos.length]);

  // ✅ sync index when user scroll-snaps on mobile
  const onMobileScroll = () => {
    if (!isMobile || !canNavigate) return;
    const el = trackRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    if (i !== index) setIndex(Math.max(0, Math.min(i, safePhotos.length - 1)));
  };

  if (!open || !currentPhoto) return null;

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
          className={[
            "relative w-full max-w-5xl rounded-3xl tsw-photo-glow",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" as any }}
          >
            {/* Close */}
            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 hover:bg-black/80"
              style={{ top: "calc(1rem + env(safe-area-inset-top))" as any }}
            >
              Chiudi ✕
            </button>

            {/* Frecce SOLO desktop */}
            {canNavigate && !isMobile && (
              <>
                <button
                  aria-label="Foto precedente"
                  onClick={goPrev}
                  className={[
                    "absolute left-4 top-1/2 -translate-y-1/2 z-20",
                    "h-11 w-11 rounded-full",
                    "border border-white/15 bg-black/55 backdrop-blur",
                    "grid place-items-center text-white/90",
                    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:bg-black/70 hover:border-white/25 hover:scale-[1.02]",
                    "hover:shadow-[0_0_22px_rgba(255,255,255,0.22)]",
                    "active:scale-[0.98]",
                  ].join(" ")}
                >
                  ‹
                </button>

                <button
                  aria-label="Foto successiva"
                  onClick={goNext}
                  className={[
                    "absolute right-4 top-1/2 -translate-y-1/2 z-20",
                    "h-11 w-11 rounded-full",
                    "border border-white/15 bg-black/55 backdrop-blur",
                    "grid place-items-center text-white/90",
                    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:bg-black/70 hover:border-white/25 hover:scale-[1.02]",
                    "hover:shadow-[0_0_22px_rgba(255,255,255,0.22)]",
                    "active:scale-[0.98]",
                  ].join(" ")}
                >
                  ›
                </button>
              </>
            )}

            {/* Immagine / Gallery */}
            <div className="relative w-full">
              {isMobile && canNavigate ? (
                <div
                  ref={trackRef}
                  onScroll={onMobileScroll}
                  className={[
                    "tsw-hide-scrollbar",
                    "flex overflow-x-auto scroll-smooth",
                    "snap-x snap-mandatory",
                    "bg-black w-full",
                    "h-[70dvh]",
                  ].join(" ")}
                >
                  {safePhotos.map((p, i) => (
                    <div
                      key={p.id}
                      data-slide={i}
                      className="snap-center shrink-0 w-full h-full relative"
                    >
                      <Image
                        src={p.src}
                        alt={p.alt ?? "Foto evento"}
                        fill
                        className="object-contain object-center p-6"
                        priority={i === index}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={[
                    "relative w-full bg-black",
                    isMobile ? "h-[70dvh]" : "h-[70vh]",
                  ].join(" ")}
                >
                  <Image
                    src={currentPhoto.src}
                    alt={currentPhoto.alt ?? "Foto evento"}
                    fill
                    className="object-contain object-center p-6"
                    priority
                  />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

              {/* hint swipe (solo mobile) */}
              {isMobile && canNavigate && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                  <div className="rounded-full bg-black/55 px-4 py-1 text-[12px] text-white/90 backdrop-blur border border-white/10">
                    ← scorri →
                  </div>
                </div>
              )}
            </div>

            {/* dots (solo mobile) */}
            {isMobile && canNavigate && (
              <div className="pb-4 pt-3 flex items-center justify-center gap-2">
                {safePhotos.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      i === index ? "bg-white/90" : "bg-white/30",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14) inset,
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
      `}</style>
    </div>
  );
}
