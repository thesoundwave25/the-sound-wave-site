"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export type FormatTrack = { title: string; src: string };
export type FormatItem = {
  id: string;
  title: string;
  logoSrc: string;
  tracks?: FormatTrack[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  format: FormatItem | null;
  formats?: FormatItem[];
  onNavigate: (next: FormatItem) => void;
};

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}

function isMobileSoft() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;
}

const FORMAT_DETAILS: Record<string, { description: string; linkHref: string }> = {
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
      "Afro House e Tribal House,Percussioni ipnotiche, groove tribali e una crescita continua che porta la pista in uno stato di trance elegante, intensa, rituale. Se cerchi un’atmosfera che si sente nello stomaco e si balla fino all’alba… benvenuto nel rito.",
    linkHref:
      "https://www.youtube.com/playlist?list=PLJNHrR97zbO-eNm7xdngZcA7zRYjPPVMH",
  },
  "all-dance-experience": {
    description:
      "Un viaggio dentro tutta l’energia dance: hit potenti, ritmo continuo e un’esperienza pensata per tenere alta la pista dall’inizio alla fine. All Dance Experience racchiude impatto, movimento e adrenalina in un unico format.",
    linkHref:
      "https://www.youtube.com/watch?v=afUaGspU528&list=PLJNHrR97zbO8adNqLzpBQXTDc3ASNPRLo",
  },
};

export default function FormatModal({
  open,
  onClose,
  format,
  formats = [],
  onNavigate,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [gestureLocked, setGestureLocked] = useState<"none" | "vertical" | "horizontal">(
    "none"
  );

  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const safeIndex = useMemo(() => {
    if (!format) return -1;
    return formats.findIndex((f) => f.id === format.id);
  }, [format, formats]);

  const hasMany = Array.isArray(formats) && formats.length > 1;

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

    if (id === "all-dance-experience") {
      return {
        glowL: "rgba(76, 201, 240, 0.72)",
        glowC: "rgba(255, 45, 252, 0.78)",
        glowR: "rgba(255, 140, 0, 0.72)",
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
      setDragY(0);
      setDragging(false);
      setSnapBack(false);
      setTouchStartY(null);
      setTouchStartX(null);
      setGestureLocked("none");
      onClose();
    }, 340);
  };

  const goPrevFormat = () => {
    if (!format || !formats.length || safeIndex < 0 || formats.length < 2) return;
    const prevIndex = (safeIndex - 1 + formats.length) % formats.length;
    const next = formats[prevIndex];
    if (next) onNavigate(next);
  };

  const goNextFormat = () => {
    if (!format || !formats.length || safeIndex < 0 || formats.length < 2) return;
    const nextIndex = (safeIndex + 1) % formats.length;
    const next = formats[nextIndex];
    if (next) onNavigate(next);
  };

  const goToIndexMobile = (i: number) => {
    const next = formats[i];
    if (!next) return;

    const el = trackRef.current;
    if (el) {
      try {
        el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
      } catch {
        el.scrollLeft = el.clientWidth * i;
      }
    }

    onNavigate(next);
  };

  const onMobileScroll = () => {
    if (!hasMany) return;
    const el = trackRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    const next = Math.max(0, Math.min(i, formats.length - 1));

    if (next !== safeIndex && formats[next]) {
      onNavigate(formats[next]);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") goPrevFormat();
      if (e.key === "ArrowRight") goNextFormat();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, safeIndex, formats, format]);

  useEffect(() => {
    if (!open || !format) return;

    setIsClosing(false);
    setDragY(0);
    setDragging(false);
    setSnapBack(false);
    setTouchStartY(null);
    setTouchStartX(null);
    setGestureLocked("none");
  }, [open, format?.id]);

  useEffect(() => {
    if (!open) return;
    if (!isMobileSoft()) return;
    if (!hasMany) return;
    if (safeIndex < 0) return;

    const el = trackRef.current;
    if (!el) return;

    window.requestAnimationFrame(() => {
      try {
        el.scrollLeft = el.clientWidth * safeIndex;
      } catch {}
    });
  }, [open, safeIndex, hasMany]);

  const onHandleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    setDragging(true);
    setSnapBack(false);
    setGestureLocked("none");
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (!dragging) return;
    if (touchStartY === null || touchStartX === null) return;

    const t = e.touches[0];
    const deltaY = t.clientY - touchStartY;
    const deltaX = t.clientX - touchStartX;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (gestureLocked === "none") {
      if (absX > 14 && absX > absY) {
        setGestureLocked("horizontal");
        return;
      } else if (absY > 10 && absY > absX) {
        setGestureLocked("vertical");
      }
    }

    if (gestureLocked === "vertical") {
      if (e.cancelable) e.preventDefault();
      const clamped = Math.max(-260, Math.min(0, deltaY));
      setDragY(clamped);
    }
  };

  const onHandleTouchEnd = () => {
    if (!isMobile) return;
    if (!dragging) return;

    if (gestureLocked === "horizontal") {
      setDragging(false);
      setTouchStartY(null);
      setTouchStartX(null);
      setGestureLocked("none");
      return;
    }

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

  if (!open || !format) return null;

  const progress = clamp(Math.abs(dragY) / 220);

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
              "max-w-5xl",
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
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
          >
            {hasMany && !isMobile && (
              <button
                type="button"
                aria-label="Format precedente"
                onClick={goPrevFormat}
                className={[
                  "absolute left-4 top-1/2 -translate-y-1/2 z-30",
                  "h-11 w-11 rounded-full",
                  "border border-white/15 bg-black/55 backdrop-blur",
                  "grid place-items-center text-white/90",
                  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:scale-[1.06] hover:bg-black/70",
                  "active:scale-[0.98]",
                ].join(" ")}
              >
                ‹
              </button>
            )}

            {hasMany && !isMobile && (
              <button
                type="button"
                aria-label="Format successivo"
                onClick={goNextFormat}
                className={[
                  "absolute right-4 top-1/2 -translate-y-1/2 z-30",
                  "h-11 w-11 rounded-full",
                  "border border-white/15 bg-black/55 backdrop-blur",
                  "grid place-items-center text-white/90",
                  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:scale-[1.06] hover:bg-black/70",
                  "active:scale-[0.98]",
                ].join(" ")}
              >
                ›
              </button>
            )}

            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Chiudi ✕
            </button>

            {isMobile && hasMany ? (
              <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl">
                <div
                  ref={trackRef}
                  tabIndex={-1}
                  onScroll={onMobileScroll}
                  className={[
                    "tsw-hide-scrollbar",
                    "flex overflow-x-auto",
                    "snap-x snap-mandatory",
                    "overscroll-x-contain",
                    "w-full",
                  ].join(" ")}
                  style={{
                    WebkitOverflowScrolling: "touch" as any,
                    touchAction: "pan-x",
                  }}
                >
                  {formats.map((item) => {
                    const itemDetails = FORMAT_DETAILS[item.id];

                    return (
                      <div
                        key={item.id}
                        className="snap-center snap-always shrink-0 w-full relative"
                      >
                        <div className="flex justify-center pt-3 pb-2">
                          <div className="h-1.5 w-12 rounded-full bg-white/20" />
                        </div>

                        <div className="relative w-full bg-black/40">
                          <div className="relative h-[220px] w-full">
                            <Image
                              src={item.logoSrc}
                              alt={item.title}
                              fill
                              className="object-contain object-center p-10"
                              priority={item.id === format.id}
                            />
                          </div>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                        </div>

                        <h3 className="px-6 py-4 text-2xl font-semibold tracking-tight text-zinc-100 text-center">
                          {item.title}
                        </h3>

                        <div className="p-6 sm:p-8">
                          {itemDetails ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                              <p className="text-sm sm:text-base leading-relaxed text-zinc-200">
                                {itemDetails.description}
                              </p>

                              <div className="mt-4">
                                <a
                                  href={itemDetails.linkHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tsw-glow-btn inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-100 active:scale-[0.99]"
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
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                              <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
                                Dettagli in arrivo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 py-3">
                  {formats.map((item, i) => {
                    const active = i === safeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`Vai a format ${i + 1}`}
                        onClick={() => goToIndexMobile(i)}
                        className={[
                          "h-2.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          active
                            ? "w-10 bg-white"
                            : "w-2.5 bg-white/30 hover:bg-white/45",
                        ].join(" ")}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="md:hidden touch-none">
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="h-1.5 w-12 rounded-full bg-white/20" />
                  </div>

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

                  <h3 className="px-6 py-4 text-2xl font-semibold tracking-tight text-zinc-100 text-center">
                    {format.title}
                  </h3>
                </div>

                <div className="hidden md:flex justify-center pt-3 pb-2">
                  <div className="h-1.5 w-12 rounded-full bg-white/20" />
                </div>

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
                  <h3 className="hidden md:block text-2xl font-semibold tracking-tight text-zinc-100 text-center mx-auto">
                    {format.title}
                  </h3>

                  <div className="hidden md:block mt-5" />

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

                  {hasMany && !isMobile && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      {formats.map((item, i) => {
                        const active = i === safeIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Vai a format ${i + 1}`}
                            onClick={() => onNavigate(item)}
                            className={[
                              "h-2.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              active
                                ? "w-10 bg-white"
                                : "w-2.5 bg-white/30 hover:bg-white/45",
                            ].join(" ")}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

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
                background:
                  radial-gradient(120% 130% at 0% 0%, var(--glowL) 0%, transparent 62%),
                  radial-gradient(150% 140% at 50% 0%, var(--glowC) 0%, transparent 64%),
                  radial-gradient(120% 130% at 100% 0%, var(--glowR) 0%, transparent 62%);
                opacity: 0.55;
                filter: blur(14px);
              }
              .tsw-shell::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: 24px;
                pointer-events: none;
                box-shadow:
                  0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                  0 0 26px var(--glowC),
                  0 0 34px var(--glowL),
                  0 0 34px var(--glowR);
                opacity: 0.38;
              }

              .tsw-hide-scrollbar {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .tsw-hide-scrollbar::-webkit-scrollbar {
                display: none;
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

              .tsw-glow-btn {
                transition:
                  transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  background 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  border-color 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1);
                box-shadow:
                  0 0 0 1px rgba(255, 255, 255, 0.22) inset,
                  0 0 14px rgba(255, 255, 255, 0.25);
              }
              .tsw-glow-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.35);
                transform: translateY(-1px);
                box-shadow:
                  0 0 0 1px rgba(255, 255, 255, 0.28) inset,
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