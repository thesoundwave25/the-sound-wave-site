"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export type FormatTrack = {
  title: string;
  src: string;
};

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
};

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}

function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FormatModal({ open, onClose, format }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  // Single track
  const activeSrc = useMemo(() => format?.tracks?.[0]?.src ?? "", [format?.id, format?.tracks]);

  const clearRAF = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrent(el.currentTime || 0);
    rafRef.current = requestAnimationFrame(tick);
  };

  const clearFadeTimer = () => {
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const fadeVolume = (target: number, ms = 320, from?: number) => {
    const el = audioRef.current;
    if (!el) return;

    clearFadeTimer();

    const start = typeof from === "number" ? from : el.volume ?? 1;
    const end = clamp(target, 0, 1);
    const steps = Math.max(1, Math.floor(ms / 16));
    const step = (end - start) / steps;

    let i = 0;
    el.volume = start;

    fadeTimerRef.current = window.setInterval(() => {
      i++;
      const v = start + step * i;
      el.volume = clamp(v, 0, 1);

      if (i >= steps) {
        el.volume = end;
        clearFadeTimer();
      }
    }, 16);
  };

  const stopAndReset = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.volume = clamp(muted ? 0 : volume);
    setIsPlaying(false);
    setCurrent(0);
    clearRAF();
    clearFadeTimer();
  };

  // Glow + LED per format (coerenti)
  const theme = useMemo(() => {
    const id = format?.id ?? "";

    if (id === "emotion") {
      const glow = "rgba(255, 0, 0, 0.85)";
      return {
        // glow popup: usa stessi colori della striscia (qui tutto rosso)
        glowL: glow,
        glowC: glow,
        glowR: glow,

        // striscia led
        ledBar: "linear-gradient(90deg, rgba(255,0,0,1), rgba(255,0,0,1))",
        ledGlow: "rgba(255, 0, 0, 0.85)",
      };
    }

    if (id === "italian-remix-party") {
      return {
        // glow popup: verde - bianco - rosso come la striscia
        glowL: "rgba(0,166,80,0.65)",
        glowC: "rgba(255,255,255,0.70)",
        glowR: "rgba(224,0,42,0.65)",

        // striscia led
        ledBar:
          "linear-gradient(90deg, #00A650 0%, #00A650 33.333%, #FFFFFF 33.333%, #FFFFFF 66.666%, #E0002A 66.666%, #E0002A 100%)",
        ledGlow: "rgba(255,255,255,0.75)",
        ledGlow2: "rgba(0,166,80,0.55)",
        ledGlow3: "rgba(224,0,42,0.55)",
      };
    }

    // the-ritual
    return {
      // glow popup: viola -> ambra -> arancio come la striscia
      glowL: "rgba(124,58,237,0.60)",
      glowC: "rgba(245,158,11,0.70)",
      glowR: "rgba(249,115,22,0.60)",

      // striscia led
      ledBar: "linear-gradient(90deg, #7C3AED 0%, #F59E0B 55%, #F97316 100%)",
      ledGlow: "rgba(245,158,11,0.75)",
      ledGlow2: "rgba(124,58,237,0.55)",
      ledGlow3: "rgba(249,115,22,0.55)",
    };
  }, [format?.id]);

  // Close con animazione + fade-out audio
  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    try {
      fadeVolume(0, 220);
    } catch {}

    window.setTimeout(() => {
      stopAndReset();
      setIsClosing(false);
      onClose();
    }, 340);
  };

  // ESC + blocco scroll
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

  // Setup audio listeners
  useEffect(() => {
    if (!open || !format) return;

    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setDuration(el.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      clearRAF();
    };
    const onPlay = () => {
      setIsPlaying(true);
      clearRAF();
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      clearRAF();
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      clearRAF();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, format?.id]);

  // Autoplay + preload + fade-in (quando apri / cambia format)
  useEffect(() => {
    if (!open || !format) return;

    setIsClosing(false);
    setIsPlaying(false);
    setCurrent(0);
    setDuration(0);

    const el = audioRef.current;
    if (!el) return;

    clearFadeTimer();
    clearRAF();

    // reset pulito
    el.pause();
    el.currentTime = 0;

    // volume base (ma partiamo da 0 per fade-in)
    el.muted = muted;
    el.volume = 0;

    // preload
    el.preload = "auto";

    const tryPlay = async () => {
      try {
        await el.play();
        // fade-in fino al volume desiderato
        fadeVolume(muted ? 0 : volume, 320, 0);
      } catch {
        // autoplay bloccato
        // ripristiniamo volume normale così quando l'utente preme play è ok
        el.volume = muted ? 0 : volume;
      }
    };

    const t = window.setTimeout(tryPlay, 70);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, format?.id]);

  // Se chiude (open=false) stop totale
  useEffect(() => {
    if (open) return;
    stopAndReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Sync volume/mute state -> elemento audio
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // se stiamo facendo un fade, non vogliamo “combattere” col timer
    clearFadeTimer();

    el.muted = muted;
    el.volume = muted ? 0 : clamp(volume);
  }, [volume, muted]);

  // Player actions
  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;

    clearFadeTimer();

    if (el.paused) {
      try {
        await el.play();
        // mini fade-in quando riparti
        el.volume = 0;
        fadeVolume(muted ? 0 : volume, 220, 0);
      } catch {
        // niente
      }
    } else {
      // mini fade-out quando metti pausa
      fadeVolume(0, 180, el.volume);
      window.setTimeout(() => {
        el.pause();
        el.volume = muted ? 0 : volume;
      }, 190);
    }
  };

  const seekTo = (t: number) => {
    const el = audioRef.current;
    if (!el || !isFinite(el.duration)) return;
    el.currentTime = clamp(t, 0, el.duration);
    setCurrent(el.currentTime);
  };

  if (!open || !format) return null;

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
            "tsw-shell",
            isClosing ? "tsw-modal-out" : "tsw-modal-in",
          ].join(" ")}
          style={
            {
              // glow popup coerente con la striscia LED
              ["--glowL" as any]: theme.glowL,
              ["--glowC" as any]: theme.glowC,
              ["--glowR" as any]: theme.glowR,
            } as React.CSSProperties
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={requestClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
          >
            Chiudi ✕
          </button>

          {/* Logo grande */}
          <div className="relative w-full bg-black/40">
            <div className="relative h-[260px] sm:h-[320px] w-full">
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

          {/* Player */}
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">{format.title}</h3>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-200 font-semibold">Player audio</div>

              {/* Audio hidden (ma accessibile) */}
              {activeSrc ? (
                <audio ref={audioRef} src={activeSrc} preload="auto" />
              ) : (
                <div className="mt-3 text-sm text-zinc-400">Nessuna traccia disponibile</div>
              )}

              {/* Custom Apple-ish player */}
              {activeSrc && (
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className={[
                        "h-10 w-10 shrink-0 rounded-full",
                        "border border-white/10 bg-white/5",
                        "grid place-items-center",
                        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "hover:bg-white/10 active:scale-[0.98]",
                      ].join(" ")}
                      aria-label={isPlaying ? "Pausa" : "Play"}
                    >
                      {isPlaying ? (
                        <span className="block h-4 w-4">
                          <span className="inline-block h-4 w-[4px] bg-white rounded-sm mr-[3px]" />
                          <span className="inline-block h-4 w-[4px] bg-white rounded-sm" />
                        </span>
                      ) : (
                        <span
                          className="block"
                          style={{
                            width: 0,
                            height: 0,
                            borderTop: "7px solid transparent",
                            borderBottom: "7px solid transparent",
                            borderLeft: "11px solid white",
                            marginLeft: "2px",
                          }}
                        />
                      )}
                    </button>

                    {/* Timeline */}
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={Math.max(1, duration)}
                        step={0.01}
                        value={Math.min(current, duration || 0)}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        className="tsw-range w-full"
                        aria-label="Progresso"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-300/80 tabular-nums">
                        <span>{fmtTime(current)}</span>
                        <span>{fmtTime(duration)}</span>
                      </div>
                    </div>

                    {/* Volume + mute */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMuted((m) => !m)}
                        className="h-9 w-9 rounded-full border border-white/10 bg-white/5 grid place-items-center hover:bg-white/10"
                        aria-label={muted ? "Attiva audio" : "Silenzia"}
                      >
                        <span className="text-white text-sm">{muted ? "🔇" : "🔊"}</span>
                      </button>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMuted(v === 0);
                          setVolume(v);
                        }}
                        className="tsw-range tsw-volume w-[120px]"
                        aria-label="Volume"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STRISCIA LED */}
              <div className="mt-4">
                <div className="relative w-full">
                  {/* glow */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 -inset-y-2 rounded-full blur-[10px] opacity-90"
                    style={{
                      background:
                        (theme as any).ledGlow2 && (theme as any).ledGlow3
                          ? `linear-gradient(90deg, ${(theme as any).ledGlow2} 0%, ${(theme as any).ledGlow} 50%, ${(theme as any).ledGlow3} 100%)`
                          : (theme as any).ledGlow,
                    }}
                  />
                  {/* bar */}
                  <div
                    className="relative h-[6px] w-full rounded-full"
                    style={{
                      background: (theme as any).ledBar,
                      boxShadow:
                        (theme as any).ledGlow2 && (theme as any).ledGlow3
                          ? `0 0 10px ${(theme as any).ledGlow}, 0 0 16px ${(theme as any).ledGlow2}, 0 0 16px ${(theme as any).ledGlow3}`
                          : `0 0 12px ${(theme as any).ledGlow}, 0 0 18px ${(theme as any).ledGlow}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Animazioni + stile player */}
          <style jsx global>{`
            .tsw-shell {
              position: relative;
            }

            /* GLOW BORDO POPUP: coerente con la striscia (L / C / R) */
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

            /* Apple-ish range */
            .tsw-range {
              -webkit-appearance: none;
              appearance: none;
              height: 6px;
              border-radius: 999px;
              background: rgba(255, 255, 255, 0.14);
              outline: none;
            }
            .tsw-range::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 14px;
              height: 14px;
              border-radius: 999px;
              background: rgba(255, 255, 255, 0.95);
              box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
              cursor: pointer;
            }
            .tsw-range::-moz-range-thumb {
              width: 14px;
              height: 14px;
              border-radius: 999px;
              background: rgba(255, 255, 255, 0.95);
              border: none;
              box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
              cursor: pointer;
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
      </div>
    </div>
  );
}
