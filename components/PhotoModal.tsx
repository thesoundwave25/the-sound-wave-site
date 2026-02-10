"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type EventItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
  imageSrc: string;

  // testo breve per la card
  cta: string;

  // testo lungo per il popup
  description: string;

  // media opzionale nel popup
  mediaType?: "image" | "video";
  mediaSrc?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  event: EventItem | null;
  events: EventItem[];
};

export default function EventModal({ open, onClose, event, events }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // --- Video refs/states (devono esistere SEMPRE per non rompere l'ordine degli hooks)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [hovering, setHovering] = useState(false);

  const [duration, setDuration] = useState(0);
  const [t, setT] = useState(0);
  const [muted, setMuted] = useState(false);

  // ✅ MOBILE ONLY: abilita swipe (senza toccare desktop)
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // ✅ FIX: indice evento gestito dentro al modal (così lo swipe cambia DAVVERO l’evento)
  const safeIndex = useMemo(() => {
    if (!event) return -1;
    return events.findIndex((e) => e.id === event.id);
  }, [event, events]);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    if (!open) return;
    // quando apro o cambia l’evento dal parent, sincronizzo l’indice interno
    if (safeIndex >= 0) setCurrentIndex(safeIndex);
  }, [open, safeIndex, event?.id]);

  const currentEvent = useMemo<EventItem | null>(() => {
    if (!events?.length) return event ?? null;
    if (currentIndex < 0) return event ?? null;
    return events[currentIndex] ?? (event ?? null);
  }, [events, currentIndex, event]);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  const go = (dir: -1 | 1) => {
    if (!events?.length) return;
    if (currentIndex < 0) return;

    const nextIndex = (currentIndex + dir + events.length) % events.length;
    setCurrentIndex(nextIndex);

    // (facoltativo) mantengo anche il CustomEvent, nel caso in futuro tu voglia ascoltarlo nel page
    window.dispatchEvent(
      new CustomEvent("tsw:event:navigate", { detail: { index: nextIndex } })
    );
  };

  // ✅ decide media (sempre, anche se event è null)
  const mt: "image" | "video" = (currentEvent?.mediaType ?? "image") as any;
  const ms: string = (currentEvent?.mediaSrc ??
    currentEvent?.imageSrc ??
    "") as any;

  // ESC + blocco scroll pagina + frecce tastiera (solo keyboard)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex, events]);

  useEffect(() => {
    if (!open) return;
    setIsClosing(false);
  }, [open]);

  // ✅ detect mobile (solo quando modal è aperto)
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(!!mq.matches);
    apply();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } else {
      mq.addListener(apply);
      return () => mq.removeListener(apply);
    }
  }, [open]);

  // ✅ Video: riparte sempre da 0 e prova autoplay con audio quando si apre
  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setShowTapToPlay(false);
    setIsPlaying(false);
    setT(0);
    setDuration(0);

    if (!open) return;
    if (mt !== "video") return;

    const v = videoRef.current;
    if (!v) return;

    try {
      v.pause();
      v.currentTime = 0;
    } catch {}

    v.muted = false;
    v.volume = 1;
    setMuted(false);

    const sync = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0);
      setT(Number.isFinite(v.currentTime) ? v.currentTime : 0);
      setIsPlaying(!v.paused && !v.ended);
      rafRef.current = requestAnimationFrame(sync);
    };
    rafRef.current = requestAnimationFrame(sync);

    const p = v.play();
    if (p && typeof (p as any).catch === "function") {
      (p as Promise<void>).catch(() => {
        setShowTapToPlay(true);
        setIsPlaying(false);
      });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        v.pause();
        v.currentTime = 0;
      } catch {}
    };
  }, [open, mt, ms, currentEvent?.id]);

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused || v.ended) {
      setShowTapToPlay(false);
      try {
        v.currentTime = 0;
      } catch {}

      v.muted = false;
      v.volume = 1;
      setMuted(false);

      try {
        await v.play();
      } catch {
        setShowTapToPlay(true);
      }
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (ratio: number) => {
    const v = videoRef.current;
    if (!v) return;
    const d = Number.isFinite(v.duration) ? v.duration : 0;
    if (!d) return;
    v.currentTime = Math.max(0, Math.min(d, d * ratio));
  };

  const requestFullscreen = async () => {
    const v = videoRef.current;
    if (!v) return;

    const anyV = v as any;
    if (typeof anyV.webkitEnterFullscreen === "function") {
      try {
        anyV.webkitEnterFullscreen();
        return;
      } catch {}
    }

    const el: any = v;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (req) {
      try {
        await req.call(el);
      } catch {}
    }
  };

  // ✅ MOBILE ONLY: swipe handlers (drag fluido + animazione)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(
    null
  );
  const gestureLockRef = useRef<"none" | "h" | "v">("none");
  const animatingRef = useRef(false);

  const setModalTransform = (tx: number, ty: number, withTransition: boolean) => {
    const el = modalRef.current;
    if (!el) return;
    el.style.transition = withTransition
      ? "transform 260ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease"
      : "none";
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  };

  const clearModalTransform = (withTransition: boolean) => {
    const el = modalRef.current;
    if (!el) return;
    el.style.transition = withTransition
      ? "transform 260ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease"
      : "none";
    el.style.transform = "";
    el.style.opacity = "";
  };

  const shouldIgnoreGesture = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (el.closest("button, a, input, textarea, select, [role='button']"))
      return true;
    if (el.closest(".tsw-no-swipe")) return true;
    return false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (animatingRef.current) return;
    if (shouldIgnoreGesture(e.target)) return;

    const t0 = e.touches?.[0];
    if (!t0) return;

    touchStartRef.current = { x: t0.clientX, y: t0.clientY, t: Date.now() };
    gestureLockRef.current = "none";
    setModalTransform(0, 0, false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (animatingRef.current) return;
    if (!touchStartRef.current) return;

    const t0 = e.touches?.[0];
    if (!t0) return;

    const dx = t0.clientX - touchStartRef.current.x;
    const dy = t0.clientY - touchStartRef.current.y;

    if (gestureLockRef.current === "none") {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx > 10 || ady > 10) {
        gestureLockRef.current = adx > ady ? "h" : "v";
      }
    }

    if (gestureLockRef.current === "h") {
      setModalTransform(dx * 0.95, 0, false);
    } else if (gestureLockRef.current === "v") {
      const up = Math.min(0, dy);
      setModalTransform(0, up * 0.9, false);
    }
  };

  const onTouchEnd = () => {
    if (!isMobile) return;
    if (animatingRef.current) return;

    const start = touchStartRef.current;
    touchStartRef.current = null;

    const el = modalRef.current;
    if (!start || !el) {
      clearModalTransform(true);
      return;
    }

    const tr = el.style.transform || "";
    const match = tr.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px,/);
    const tx = match ? Number(match[1]) : 0;
    const ty = match ? Number(match[2]) : 0;

    const elapsed = Math.max(1, Date.now() - start.t);

    const absX = Math.abs(tx);
    const absY = Math.abs(ty);

    const swipeX = absX > 70 || (absX > 35 && absX / elapsed > 0.6);
    const swipeUp = ty < -90 || (ty < -45 && absY / elapsed > 0.7);

    if (gestureLockRef.current === "h" && swipeX) {
      animatingRef.current = true;

      const dir: -1 | 1 = tx < 0 ? 1 : -1; // trascino a sx => prossimo
      const outX = tx < 0 ? -420 : 420;

      setModalTransform(outX, 0, true);

      window.setTimeout(() => {
        go(dir);

        setModalTransform(-outX, 0, false);

        requestAnimationFrame(() => {
          setModalTransform(0, 0, true);
          window.setTimeout(() => {
            animatingRef.current = false;
            clearModalTransform(false);
          }, 270);
        });
      }, 240);

      return;
    }

    if (gestureLockRef.current === "v" && swipeUp) {
      animatingRef.current = true;

      el.style.opacity = "1";
      el.style.transition =
        "transform 240ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease";
      el.style.transform = `translate3d(0, -240px, 0)`;
      el.style.opacity = "0";

      window.setTimeout(() => {
        animatingRef.current = false;
        clearModalTransform(false);
        requestClose();
      }, 220);

      return;
    }

    clearModalTransform(true);
    window.setTimeout(() => clearModalTransform(false), 280);
  };

  // ✅ return null SOLO dopo gli hooks
  if (!open || !currentEvent) return null;

  const isVideo = mt === "video";

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
        <div
          ref={modalRef}
          className={[
            "relative w-full max-w-[560px] rounded-3xl tsw-event-glow",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl">
            {/* Close */}
            <button
              onClick={requestClose}
              className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Chiudi ✕
            </button>

            {/* Media */}
            <div
              className="relative w-full bg-black"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <div className="relative w-full bg-black">
                <div
                  className={[
                    "relative w-full",
                    "aspect-[9/16]",
                    "max-h-[76vh]",
                    "mx-auto",
                  ].join(" ")}
                >
                  {isVideo ? (
                    <video
                      ref={videoRef}
                      src={ms}
                      className="h-full w-full object-contain"
                      playsInline
                      controls={false}
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsPlaying(false);
                        setShowTapToPlay(true);
                        try {
                          const v = videoRef.current;
                          if (v) v.currentTime = 0;
                        } catch {}
                      }}
                    />
                  ) : (
                    <Image
                      src={ms}
                      alt={currentEvent.title}
                      fill
                      className="object-contain object-center"
                      priority
                    />
                  )}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

              {isVideo && (
                <>
                  {(showTapToPlay || !isPlaying) && (
                    <button
                      onClick={togglePlay}
                      className={[
                        "absolute left-4 top-4 z-20",
                        "inline-flex items-center gap-3",
                        "rounded-full border border-white/15 bg-black/55 backdrop-blur",
                        "px-4 py-2 text-sm text-white/90",
                        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "hover:bg-black/70 hover:border-white/25 hover:scale-[1.02]",
                        "active:scale-[0.98]",
                      ].join(" ")}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/35">
                        ▶
                      </span>
                      <span>Riproduci</span>
                    </button>
                  )}

                  <div
                    className={[
                      "absolute inset-x-0 bottom-0 z-20",
                      "px-5 pb-4 pt-2",
                      "transition-opacity duration-300",
                      hovering || isPlaying ? "opacity-100" : "opacity-0",
                      "tsw-no-swipe",
                    ].join(" ")}
                  >
                    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2">
                      <div
                        className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/15"
                        onClick={(e) => {
                          const r = (
                            e.currentTarget as HTMLDivElement
                          ).getBoundingClientRect();
                          const ratio = (e.clientX - r.left) / r.width;
                          seek(ratio);
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 h-1.5 rounded-full bg-white/75"
                          style={{
                            width:
                              duration > 0
                                ? `${Math.min(100, (t / duration) * 100)}%`
                                : "0%",
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlay}
                            className={[
                              "h-9 w-9 rounded-full",
                              "border border-white/15 bg-black/35",
                              "grid place-items-center text-white/90",
                              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              "hover:bg-black/55 hover:border-white/25 hover:scale-[1.03]",
                              "active:scale-[0.98]",
                            ].join(" ")}
                            aria-label={isPlaying ? "Pausa" : "Play"}
                          >
                            {isPlaying ? "❚❚" : "▶"}
                          </button>

                          <button
                            onClick={toggleMute}
                            className={[
                              "h-9 w-9 rounded-full",
                              "border border-white/15 bg-black/35",
                              "grid place-items-center text-white/90",
                              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              "hover:bg-black/55 hover:border-white/25 hover:scale-[1.03]",
                              "active:scale-[0.98]",
                            ].join(" ")}
                            aria-label={
                              muted ? "Riattiva audio" : "Disattiva audio"
                            }
                          >
                            {muted ? "🔇" : "🔊"}
                          </button>

                          <button
                            onClick={requestFullscreen}
                            className={[
                              "h-9 w-9 rounded-full",
                              "border border-white/15 bg-black/35",
                              "grid place-items-center text-white/90",
                              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              "hover:bg-black/55 hover:border-white/25 hover:scale-[1.03]",
                              "active:scale-[0.98]",
                            ].join(" ")}
                            aria-label="Schermo intero"
                            title="Schermo intero"
                          >
                            ⛶
                          </button>

                          <div className="ml-1 text-xs text-white/70 tabular-nums">
                            {fmt(t)} / {fmt(duration)}
                          </div>
                        </div>

                        <div className="text-xs text-white/60">
                          {currentEvent.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Text */}
            <div className="p-6 sm:p-8">
              <div className="text-sm text-zinc-400">
                {currentEvent.date} • {currentEvent.venue}
              </div>

              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {currentEvent.title}
              </h3>

              <p className="mt-4 max-w-3xl text-zinc-300 leading-relaxed">
                {currentEvent.description}
              </p>
            </div>
          </div>

          <style jsx global>{`
            .tsw-event-glow::before {
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
              opacity: 0.22;
              filter: blur(16px);
            }
            .tsw-event-glow::after {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: 24px;
              pointer-events: none;
              box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14) inset,
                0 0 16px rgba(255, 255, 255, 0.22),
                0 0 34px rgba(255, 255, 255, 0.14);
              opacity: 0.62;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
