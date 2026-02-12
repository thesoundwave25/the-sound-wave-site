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

  const safeIndex = useMemo(() => {
    if (!event) return -1;
    return events.findIndex((e) => e.id === event.id);
  }, [event, events]);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  const go = (dir: -1 | 1) => {
    if (!event) return;
    if (!events?.length) return;
    if (safeIndex < 0) return;

    const nextIndex = (safeIndex + dir + events.length) % events.length;
    window.dispatchEvent(
      new CustomEvent("tsw:event:navigate", { detail: { index: nextIndex } })
    );
  };

  // ✅ decide media (sempre, anche se event è null)
  const mt: "image" | "video" = (event?.mediaType ?? "image") as any;
  const ms: string = (event?.mediaSrc ?? event?.imageSrc ?? "") as any;

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
  }, [open, safeIndex, events]);

  useEffect(() => {
    if (!open) return;
    setIsClosing(false);
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

    // audio ON (può essere bloccato da alcuni browser se non “gesture”)
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
  }, [open, mt, ms, event?.id]);

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

      // riparti sempre da 0
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

    // iOS Safari spesso usa questo
    const anyV = v as any;
    if (typeof anyV.webkitEnterFullscreen === "function") {
      try {
        anyV.webkitEnterFullscreen();
        return;
      } catch {}
    }

    // standard fullscreen
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

  // ✅ return null SOLO dopo gli hooks
  if (!open || !event) return null;

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
        {/* ✅ popup più “portrait” (9:16 vibe) */}
        <div
          className={[
            "relative w-full max-w-[560px] rounded-3xl tsw-event-glow",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
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
              {/* ✅ media più grande + proporzioni più “verticali” */}
              <div className="relative w-full bg-black">
                <div
                  className={[
                    "relative w-full",
                    // 9:16 per locandine / reel
                    "aspect-[9/16]",
                    // limite altezza per non “sfondare” lo schermo
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
                      alt={event.title}
                      fill
                      className="object-contain object-center"
                      priority
                    />
                  )}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

              {/* Controls (solo video) */}
              {isVideo && (
                <>
                  {/* Tap-to-play overlay */}
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

                  {/* ✅ player più sottile */}
                  <div
                    className={[
                      "absolute inset-x-0 bottom-0 z-20",
                      "px-5 pb-4 pt-2",
                      "transition-opacity duration-300",
                      hovering || isPlaying ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  >
                    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2">
                      {/* progress */}
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

                          {/* ✅ Fullscreen */}
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
                          {event.title}
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
                {event.date} • {event.venue}
              </div>

              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {event.title}
              </h3>

              <p className="mt-4 max-w-3xl text-zinc-300 leading-relaxed">
                {event.description}
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
