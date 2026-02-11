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

  // ✅ store scroll while locked (avoid iOS jump)
  const scrollLockYRef = useRef(0);

  // ✅ store the element that had focus when opening (usually the clicked card button)
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  const currentPhoto: PhotoItem | null = useMemo(() => {
    if (safePhotos.length > 0) return safePhotos[index] ?? safePhotos[0] ?? null;
    return photo ?? null;
  }, [safePhotos, index, photo]);

  // ==========================
  // ✅ Apple swipe-to-close (MOBILE ONLY)
  // ==========================
  const [dragY, setDragY] = useState(0); // negativo = swipe up
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [gestureLocked, setGestureLocked] = useState<
    "none" | "drag" | "ignore"
  >("none");

  const resetDrag = () => {
    setDragY(0);
    setDragging(false);
    setSnapBack(false);
    setTouchStartY(null);
    setTouchStartX(null);
    setGestureLocked("none");
  };

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    // ✅ blur ASAP to prevent focus-restore scroll jump
    try {
      (document.activeElement as HTMLElement | null)?.blur?.();
    } catch {}

    window.setTimeout(() => {
      setIsClosing(false);
      resetDrag();
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

  // ✅ When modal opens: remove focus from the clicked thumbnail button (iOS jump fix)
  useEffect(() => {
    if (!open) return;

    resetDrag();

    try {
      lastActiveElRef.current = document.activeElement as HTMLElement | null;
      lastActiveElRef.current?.blur?.();
    } catch {
      lastActiveElRef.current = null;
    }

    // focus neutro (Safari)
    window.requestAnimationFrame(() => {
      try {
        trackRef.current?.focus?.();
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Quando apro il modal: set index dalla foto cliccata
  useEffect(() => {
    if (!open) return;
    setIsClosing(false);

    if (safePhotos.length > 0 && photo) {
      const found = safePhotos.findIndex((p) => p.id === photo.id);
      setIndex(found >= 0 ? found : 0);

      // ✅ Mobile: porta la track alla slide iniziale SOLO all’apertura
      const el = trackRef.current;
      if (el && isMobile) {
        window.requestAnimationFrame(() => {
          el.scrollLeft = el.clientWidth * (found >= 0 ? found : 0);
        });
      }
    } else {
      setIndex(0);
      const el = trackRef.current;
      if (el && isMobile) {
        window.requestAnimationFrame(() => {
          el.scrollLeft = 0;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photo?.id, safePhotos.length]);

  // ✅ ESC + body/html lock (iOS safe) + arrows desktop
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

    const body = document.body;
    const html = document.documentElement;

    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const prevHtmlOverflow = html.style.overflow;

    // ✅ prevent Safari auto restoration
    const prevScrollRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {}

    const scrollY = window.scrollY;
    scrollLockYRef.current = scrollY;

    // lock
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    if (isMobile) {
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      // ✅ prevent focus-jump on close (iOS)
      try {
        (document.activeElement as HTMLElement | null)?.blur?.();
        lastActiveElRef.current?.blur?.();
      } catch {}

      const restoreY = scrollLockYRef.current;

      // restore styles
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      html.style.overflow = prevHtmlOverflow;

      // restore scroll restoration
      try {
        window.history.scrollRestoration = prevScrollRestoration;
      } catch {}

      // ✅ double rAF to avoid 1-frame jump
      if (isMobile) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, restoreY);
          });
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile, canNavigate, safePhotos.length]);

  // ✅ aggiorna index durante scroll (solo per dots/indicator)
  const onMobileScroll = () => {
    if (!isMobile || !canNavigate) return;
    const el = trackRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    const next = Math.max(0, Math.min(i, safePhotos.length - 1));
    if (next !== index) setIndex(next);
  };

  // ==========================
  // ✅ Unified swipe handlers (mobile only)
  // - Se l'intenzione è orizzontale -> ignore (lascia scorrere foto)
  // - Se l'intenzione è verticale -> drag (chiusura)
  // ==========================
  const onSwipeTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    setDragging(true);
    setSnapBack(false);
    setGestureLocked("none");
  };

  const onSwipeTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (!dragging) return;
    if (touchStartY === null || touchStartX === null) return;

    const t = e.touches[0];
    const deltaY = t.clientY - touchStartY; // negativo = swipe up
    const deltaX = t.clientX - touchStartX;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // blocca l'intenzione SOLO una volta
    if (gestureLocked === "none") {
      // preferiamo lasciare orizzontale quando è evidente
      if (absX > 14 && absX > absY) {
        setGestureLocked("ignore");
        return;
      }
      if (absY > 10 && absY > absX) {
        setGestureLocked("drag");
      }
    }

    if (gestureLocked === "ignore") return;

    // durante drag verticale, impediamo che iOS “rubì” la gesture
    try {
      e.preventDefault();
    } catch {}

    // solo swipe UP
    const clamped = Math.max(-260, Math.min(0, deltaY));
    setDragY(clamped);
  };

  const onSwipeTouchEnd = () => {
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
    setGestureLocked("none");
  };

  if (!open || !currentPhoto) return null;

  const progress = Math.min(1, Math.max(0, Math.abs(dragY) / 220));

  const draggableStyle: React.CSSProperties = isMobile
    ? { transform: `translateY(${dragY}px) scale(${1 - progress * 0.01})` }
    : {};

  const backdropStyle: React.CSSProperties = isMobile
    ? { opacity: 1 - progress * 0.25 }
    : {};

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        onMouseDown={(e) => e.preventDefault()} // ✅ avoid focus
        style={backdropStyle}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* ✅ DRAG WRAPPER (solo mobile) — desktop invariato */}
        <div
          className={["md:touch-auto", snapBack ? "tsw-drag-snap" : ""].join(
            " "
          )}
          style={draggableStyle}
        >
          <div
            className={[
              "relative w-full max-w-5xl rounded-3xl tsw-photo-glow",
              isClosing ? "tsw-modal-out" : "tsw-modal-in",
              // mobile un filo più alto, desktop invariato
              "max-h-[92svh] md:max-h-none",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" as any }}
            >
              {/* ✅ SWIPE HANDLE (solo mobile, hint) */}
              <div
                className="md:hidden"
                onTouchStart={onSwipeTouchStart}
                onTouchMove={onSwipeTouchMove}
                onTouchEnd={onSwipeTouchEnd}
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className="h-1.5 w-12 rounded-full bg-white/20" />
                </div>
                {/* fascia “presa facile” */}
                <div className="h-2" />
              </div>

              {/* Close */}
              <button
                onClick={requestClose}
                onMouseDown={(e) => e.preventDefault()} // ✅ avoid focus
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
                    onMouseDown={(e) => e.preventDefault()} // ✅ avoid focus
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
                    onMouseDown={(e) => e.preventDefault()} // ✅ avoid focus
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

              {/* ✅ Immagine / Gallery
                  - mobile: qui agganciamo anche lo swipe-to-close, MA con intent detection
                  - così lo swipe orizzontale tra foto resta perfetto */}
              <div
                className="relative w-full"
                onTouchStart={isMobile ? onSwipeTouchStart : undefined}
                onTouchMove={isMobile ? onSwipeTouchMove : undefined}
                onTouchEnd={isMobile ? onSwipeTouchEnd : undefined}
                style={
                  isMobile
                    ? ({
                        // consenti pan-x (scorrere foto) ma non bloccare il browser: noi decidiamo con intent detection
                        touchAction: canNavigate ? "pan-x" : "none",
                      } as any)
                    : undefined
                }
              >
                {isMobile && canNavigate ? (
                  <div
                    ref={trackRef}
                    tabIndex={-1} // ✅ focus target to avoid focusing thumbnails under
                    onScroll={onMobileScroll}
                    className={[
                      "tsw-hide-scrollbar",
                      "flex overflow-x-auto",
                      "snap-x snap-mandatory",
                      "overscroll-x-contain",
                      "bg-black w-full",
                      "h-[70dvh]",
                    ].join(" ")}
                    style={{
                      WebkitOverflowScrolling: "touch" as any,
                      // lascia orizzontale fluido
                      touchAction: "pan-x",
                    }}
                  >
                    {safePhotos.map((p, i) => (
                      <div
                        key={p.id}
                        data-slide={i}
                        className="snap-center snap-always shrink-0 w-full h-full relative"
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
      </div>

      <style jsx global>{`
        .tsw-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .tsw-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

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

        /* ✅ snap-back (solo mobile wrapper) */
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
