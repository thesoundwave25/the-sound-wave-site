"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type PhotoItem = {
  id: string;
  src: string; // es: "/gallery/1.jpg"
  alt?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  photo: PhotoItem | null;

  // ✅ opzionale: se lo passi, abiliti frecce + scorrimento nel popup
  photos?: PhotoItem[];
};

export default function PhotoModal({ open, onClose, photo, photos }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const safePhotos = useMemo(() => (Array.isArray(photos) ? photos : []), [photos]);

  // index valido SOLO se safePhotos è presente
  const [index, setIndex] = useState(0);

  const canNavigate = safePhotos.length > 1;

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

  // Quando apro il modal: se ho la lista, setto l’index partendo dalla foto cliccata
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

  // ESC + blocco scroll + frecce tastiera
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canNavigate, safePhotos.length]);

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
        {/* ✅ Wrapper glow (NON overflow-hidden) */}
        <div
          className={[
            "relative w-full max-w-5xl",
            "rounded-3xl",
            "tsw-photo-glow",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ Card interna con overflow-hidden */}
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl">
            {/* Close */}
            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Chiudi ✕
            </button>

            {/* ✅ Frecce dentro popup (solo se photos è passato) */}
            {canNavigate && (
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

            {/* Immagine */}
            <div className="relative w-full">
              <div className="relative h-[70vh] w-full bg-black">
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
        </div>
      </div>

      {/* Animazioni + Glow */}
      <style jsx global>{`
        /* ✅ Glow esterno (non tagliato perché sta sul wrapper) */
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
