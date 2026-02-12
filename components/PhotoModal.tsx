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

function isMobileSoft() {
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

  // Track ref (scroll orizzontale su mobile)
  const trackRef = useRef<HTMLDivElement | null>(null);

  // store scroll while locked (avoid iOS jump)
  const scrollLockYRef = useRef(0);

  // store the element that had focus when opening (usually the clicked card button)
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // ✅ NEW: restore focus without triggering scroll to the gallery
  const restoreFocusNoScroll = () => {
    const el = lastActiveElRef.current;
    if (!el) return;
    try {
      // focus without scroll (modern browsers)
      (el as any).focus?.({ preventScroll: true });
    } catch {
      try {
        el.focus?.();
      } catch {}
    }
  };

  const currentPhoto: PhotoItem | null = useMemo(() => {
    if (safePhotos.length > 0) return safePhotos[index] ?? safePhotos[0] ?? null;
    return photo ?? null;
  }, [safePhotos, index, photo]);

  // ==========================
  // Apple swipe-to-close (MOBILE ONLY)
  // ==========================
  const [dragY, setDragY] = useState(0); // negativo = swipe up
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [gestureLocked, setGestureLocked] = useState<"none" | "drag" | "ignore">(
    "none"
  );

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

    // Rimuoviamo il focus da qualsiasi elemento attivo per evitare "salti" verso bottoni della gallery
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement)?.blur();
    }

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

  // When modal opens: remove focus from the clicked thumbnail button (iOS jump fix)
  useEffect(() => {
    if (!open) return;
    

    resetDrag();

    try {
      lastActiveElRef.current = document.activeElement as HTMLElement | null;
      lastActiveElRef.current?.blur?.();
    } catch {
      lastActiveElRef.current = null;
    }

    // ✅ focus SOLO su mobile (su desktop può dare “linee”/indicatori strani)
    window.requestAnimationFrame(() => {
      if (!isMobileSoft()) return;
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
      const nextIndex = found >= 0 ? found : 0;
      setIndex(nextIndex);

      // Mobile: porta la track alla slide iniziale SOLO all’apertura
      const el = trackRef.current;
      if (el && isMobileSoft()) {
        window.requestAnimationFrame(() => {
          el.scrollLeft = el.clientWidth * nextIndex;
        });
      }
    } else {
      setIndex(0);
      const el = trackRef.current;
      if (el && isMobileSoft()) {
        window.requestAnimationFrame(() => {
          el.scrollLeft = 0;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photo?.id, safePhotos.length]);

  // Gestione ESC, Frecce e Blocco Scroll (Fix per evitare il salto alla chiusura)
 useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (!isMobileSoft() && canNavigate) {
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

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    scrollLockYRef.current = scrollY;

    if (isMobileSoft()) {
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "hidden";
    }
    html.style.overflow = "hidden";

   return () => {
      document.removeEventListener("keydown", onKeyDown);

      // Ripristino stili
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      html.style.overflow = "";

      // Ripristino scroll IMMEDIATO forzando 'instat'
      if (isMobileSoft()) {
        window.scrollTo({
          top: scrollLockYRef.current,
          behavior: 'instant' // <--- Forza il salto immediato ignorando il CSS
        });
        
        // Doppio check per Safari Mobile
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollLockYRef.current,
            behavior: 'instant'
          });
        });
      }
      
      try {
        (document.activeElement as HTMLElement)?.blur();
      } catch {}
    };
  }, [open, canNavigate, safePhotos.length]);

  // aggiorna index durante scroll (solo per dots/indicator)
  const onMobileScroll = () => {
    if (!canNavigate) return;
    const el = trackRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    const next = Math.max(0, Math.min(i, safePhotos.length - 1));
    if (next !== index) setIndex(next);
  };

  // Unified swipe handlers (mobile only)
  const onSwipeTouchStart = (e: React.TouchEvent) => {
    if (!isMobileSoft()) return;

    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    setDragging(true);
    setSnapBack(false);
    setGestureLocked("none");
  };

const onSwipeTouchMove = (e: React.TouchEvent) => {
    if (!isMobileSoft() || !dragging || touchStartY === null || touchStartX === null) return;

    const t = e.touches[0];
    const deltaY = t.clientY - touchStartY;
    const deltaX = t.clientX - touchStartX;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (gestureLocked === "none") {
      if (absX > 14 && absX > absY) {
        setGestureLocked("ignore");
        return;
      }
      if (absY > 10 && absY > absX) {
        setGestureLocked("drag");
      }
    }

    if (gestureLocked === "ignore") return;

    // Fix per l'errore in console: blocca lo scroll solo se l'evento è cancellabile
    if (e.cancelable) {
      e.preventDefault();
    }

    const clamped = Math.max(-260, Math.min(0, deltaY));
    setDragY(clamped);
  };

  const onSwipeTouchEnd = () => {
    if (!isMobileSoft()) return;
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

  const draggableStyle: React.CSSProperties = isMobileSoft()
    ? { transform: `translateY(${dragY}px) scale(${1 - progress * 0.01})` }
    : {};

  const backdropStyle: React.CSSProperties = isMobileSoft()
    ? { opacity: 1 - progress * 0.25 }
    : {};

  const isMobile = isMobileSoft();

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        onMouseDown={(e) => e.preventDefault()}
        style={backdropStyle}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-0 md:p-4">
        {/* drag wrapper (si muove solo su mobile reale) */}
        <div
          className={`${snapBack ? "tsw-drag-snap" : ""} ${
            !isMobile ? "w-full flex justify-center" : ""
          }`}
          style={draggableStyle}
        >
          {/* =======================
              ✅ DESKTOP RIPRISTINATO
             ======================= */}
          {!isMobile ? (
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
                <button
                  onClick={requestClose}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 hover:bg-black/80"
                  style={{ top: "calc(1rem + env(safe-area-inset-top))" as any }}
                >
                  Chiudi ✕
                </button>

                {canNavigate && (
                  <>
                    <button
                      aria-label="Foto precedente"
                      onClick={goPrev}
                      onMouseDown={(e) => e.preventDefault()}
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
                      onMouseDown={(e) => e.preventDefault()}
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

                <div className="relative w-full bg-black h-[70vh]">
                  <Image
                    src={currentPhoto.src}
                    alt={currentPhoto.alt ?? "Foto evento"}
                    fill
                    className="object-contain object-center p-6"
                    priority
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              </div>
            </div>
          ) : (
            /* =======================
   ✅ MOBILE: STILE APPLE (solo grafica)
 ======================= */
<div
  className={[
    // invece di full screen edge-to-edge -> card centrata con padding
    "relative mx-auto w-[calc(100vw-24px)] h-[calc(100dvh-24px)]",
    "rounded-3xl tsw-photo-glow",
    isClosing ? "tsw-modal-out" : "tsw-modal-in",
  ].join(" ")}
  role="dialog"
  aria-modal="true"
  onClick={(e) => e.stopPropagation()}
  onTouchStart={onSwipeTouchStart}
  onTouchMove={onSwipeTouchMove}
  onTouchEnd={onSwipeTouchEnd}
  style={
    {
      touchAction: canNavigate ? "pan-x" : "none",
    } as any
  }
>
  <div
    className={[
      // shell “apple”
      "relative w-full h-full overflow-hidden rounded-3xl",
      "border border-white/10 bg-zinc-950/85 shadow-2xl",
      "flex flex-col",
    ].join(" ")}
    style={{
      paddingTop: "env(safe-area-inset-top)" as any,
      paddingBottom: "env(safe-area-inset-bottom)" as any,
    }}
  >
    {/* barretta (rimane) */}
    <div className="flex justify-center pt-3 pb-2">
      <div className="h-1.5 w-12 rounded-full bg-white/20" />
    </div>

    {/* area foto: diventa flex-1 così non usiamo più 86dvh fissi */}
    <div className="relative w-full flex-1">
      {canNavigate ? (
        <div
          ref={trackRef}
          tabIndex={-1}
          onScroll={onMobileScroll}
          className={[
            "tsw-hide-scrollbar",
            "flex overflow-x-auto",
            "snap-x snap-mandatory",
            "overscroll-x-contain",
            "w-full h-full",
          ].join(" ")}
          style={{
            WebkitOverflowScrolling: "touch" as any,
            touchAction: "pan-x",
          }}
        >
          {safePhotos.map((p, i) => (
            <div
              key={p.id}
              className="snap-center snap-always shrink-0 w-full h-full relative"
            >
              <Image
                src={p.src}
                alt={p.alt ?? "Foto evento"}
                fill
                className="object-contain object-center p-3"
                priority={i === index}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.alt ?? "Foto evento"}
            fill
            className="object-contain object-center p-3"
            priority
          />
        </div>
      )}

      {/* gradient come desktop */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
    </div>

    {/* dots (rimangono) */}
    {canNavigate && (
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

          )}
        </div>
      </div>

      <style jsx global>{`
        /* Fallback: se il browser non supporta dvh, usiamo vh */
        .tsw-h100 {
          height: 100vh;
          height: 100dvh;
        }
        .tsw-h86 {
          height: 86vh;
          height: 86dvh;
        }
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

  /* glow più morbido → elimina linee blu edge iOS */
  background: radial-gradient(
    120% 120% at 50% 20%,
    rgba(255,255,255,0.18) 0%,
    transparent 70%
  );

  opacity: 0.25;
  filter: blur(22px);
}

.tsw-photo-glow::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  pointer-events: none;

  /* niente highlight edge → niente righe blu */
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.10) inset,
    0 0 18px rgba(255,255,255,0.12);

  opacity: 0.5;
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
