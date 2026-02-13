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

function isMobileSoft() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches; // < md
}

export default function EventModal({ open, onClose, event, events }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [closingViaSwipe, setClosingViaSwipe] = useState(false);

  // ==========================
  // Swipe gestures (MOBILE ONLY)
  // - UP: close
  // - LEFT/RIGHT: navigate events
  // ==========================
  const [dragY, setDragY] = useState(0); // negativo = swipe up
  const [dragging, setDragging] = useState(false);
  const [snapBack, setSnapBack] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [gestureLocked, setGestureLocked] = useState<"none" | "drag" | "ignore">(
    "none"
  );

  // ✅ RAF throttle per swipe verticale
  const dragYRef = useRef(0);
  const dragRafRef = useRef<number | null>(null);

  // ✅ tracking swipe orizzontale
  const lastXRef = useRef<number | null>(null);

  // ==========================
  // ✅ LIVE-DRAG (orizzontale) animation (MOBILE ONLY)
  // ==========================
  const [navX, setNavX] = useState(0); // segue dito
  const [navA, setNavA] = useState(1); // fade leggero
  const [navSnap, setNavSnap] = useState(false); // abilita transizione quando serve (end/snap)
  const navXRef = useRef(0);

  const resetNav = () => {
    navXRef.current = 0;
    setNavX(0);
    setNavA(1);
    setNavSnap(false);
  };

  const resetDrag = () => {
    setDragY(0);
    setDragging(false);
    setSnapBack(false);
    setTouchStartY(null);
    setTouchStartX(null);
    setGestureLocked("none");
    lastXRef.current = null;
    resetNav();
  };

  const onSwipeTouchStart = (e: React.TouchEvent) => {
    if (!isMobileSoft()) return;
    const t = e.touches[0];
    setTouchStartY(t.clientY);
    setTouchStartX(t.clientX);
    lastXRef.current = t.clientX;

    setDragging(true);
    setSnapBack(false);
    setGestureLocked("none");

    // ✅ reset live-drag state
    resetNav();
  };

  const onSwipeTouchMove = (e: React.TouchEvent) => {
    if (
      !isMobileSoft() ||
      !dragging ||
      touchStartY === null ||
      touchStartX === null
    )
      return;

    const t = e.touches[0];
    lastXRef.current = t.clientX;

    const deltaY = t.clientY - touchStartY; // negativo = up
    const deltaX = t.clientX - touchStartX;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // decide gesto (evita conflitti tra swipe laterale e swipe up)
    if (gestureLocked === "none") {
      if (absX > 14 && absX > absY) {
        setGestureLocked("ignore"); // orizzontale
      } else if (absY > 10 && absY > absX) {
        setGestureLocked("drag"); // verticale
      }
    }

    // ✅ ORIZZONTALE: live-drag grafico (segue dito)
    if (gestureLocked === "ignore") {
      // evita scroll pagina solo se cancellabile
      if (e.cancelable) e.preventDefault();

      // clamp per non trascinare troppo
      const clampedX = Math.max(-140, Math.min(140, deltaX));
      navXRef.current = clampedX;

      // fade leggero (più trascini, più cala)
      const a = 1 - Math.min(0.22, Math.abs(clampedX) / 600);
      setNavSnap(false);
      setNavX(clampedX);
      setNavA(a);

      return;
    }

    // ✅ VERTICALE: comportamento invariato (swipe up close)
    if (gestureLocked === "drag") {
      // evita scroll pagina solo se cancellabile
      if (e.cancelable) e.preventDefault();

      // solo swipe UP (valori negativi)
      const clampedY = Math.max(-260, Math.min(0, deltaY));
      dragYRef.current = clampedY;

      if (dragRafRef.current == null) {
        dragRafRef.current = window.requestAnimationFrame(() => {
          dragRafRef.current = null;
          setDragY(dragYRef.current);
        });
      }
    }
  };

  const safeIndex = useMemo(() => {
    if (!event) return -1;
    return events.findIndex((e) => e.id === event.id);
  }, [event, events]);

  const navigateTo = (index: number) => {
    if (!events?.length) return;
    const clamped = ((index % events.length) + events.length) % events.length;
    window.dispatchEvent(
      new CustomEvent("tsw:event:navigate", { detail: { index: clamped } })
    );
  };

  const requestClose = () => {
    if (isClosing) return;

    // click/ESC/backdrop = comportamento normale
    setClosingViaSwipe(false);

    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 340);
  };

  // ✅ chiusura dedicata allo swipe: niente transform sul popup (evita lo "scatto")
  const requestCloseSwipe = () => {
    if (isClosing) return;

    setClosingViaSwipe(true);

    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setClosingViaSwipe(false);
      onClose();
    }, 340);
  };

  const go = (dir: -1 | 1) => {
    if (!event) return;
    if (!events?.length) return;
    if (safeIndex < 0) return;
    if (events.length < 2) return;

    const nextIndex = (safeIndex + dir + events.length) % events.length;
    navigateTo(nextIndex);
  };

  const onSwipeTouchEnd = () => {
    if (!isMobileSoft() || !dragging) return;

    // ✅ se c’è un frame verticale ancora in coda, lo annulliamo
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }

    // ✅ 1) Se era uno swipe orizzontale -> live-drag snap + navigate
    if (gestureLocked === "ignore" && touchStartX !== null && events?.length > 1) {
      const endX = lastXRef.current ?? touchStartX;
      const dx = endX - touchStartX;

      const H_TH = 60; // soglia swipe laterale

      // abilita transizione per lo snap
      setNavSnap(true);

      if (dx < -H_TH) {
        // swipe left -> next (contenuto va a sinistra e cambia)
        setNavX(-180);
        setNavA(0);

        window.setTimeout(() => {
          go(1);
          // rientra da destra
          setNavX(180);
          setNavA(0);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setNavX(0);
              setNavA(1);
              window.setTimeout(() => setNavSnap(false), 260);
            });
          });
        }, 130);
      } else if (dx > H_TH) {
        // swipe right -> prev (contenuto va a destra e cambia)
        setNavX(180);
        setNavA(0);

        window.setTimeout(() => {
          go(-1);
          // rientra da sinistra
          setNavX(-180);
          setNavA(0);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setNavX(0);
              setNavA(1);
              window.setTimeout(() => setNavSnap(false), 260);
            });
          });
        }, 130);
      } else {
        // non abbastanza -> snap back
        setNavX(0);
        setNavA(1);
        window.setTimeout(() => setNavSnap(false), 260);
      }

      // reset gesture (non tocchiamo il resto)
      setDragging(false);
      setTouchStartY(null);
      setTouchStartX(null);
      setGestureLocked("none");
      lastXRef.current = null;
      return;
    }

    // ✅ 2) Altrimenti swipe verticale (chiusura) — invariato
    const TH = 140;
    const CLOSE_Y = -360; // quanto “sparisce” verso l’alto

    if (dragY < -TH) {
      setSnapBack(true);
      setDragY(CLOSE_Y);

      // ✅ avvia subito la chiusura: niente “freno” percepito
      requestCloseSwipe();
    } else {
      // snap back
      setSnapBack(true);
      setDragY(0);
      window.setTimeout(() => setSnapBack(false), 260);
    }

    setDragging(false);
    setTouchStartY(null);
    setTouchStartX(null);
    setGestureLocked("none");
    lastXRef.current = null;
  };

  // --- Video refs/states (devono esistere SEMPRE per non rompere l'ordine degli hooks)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [hovering, setHovering] = useState(false);

  const [duration, setDuration] = useState(0);
  const [t, setT] = useState(0);
  const [muted, setMuted] = useState(false);

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
    setClosingViaSwipe(false);
    resetDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ✅ return null SOLO dopo gli hooks
  if (!open || !event) return null;

  const progress = Math.min(1, Math.max(0, Math.abs(dragY) / 220));

  const draggableStyle: React.CSSProperties = isMobileSoft()
    ? { transform: `translate3d(0, ${dragY}px, 0) scale(${1 - progress * 0.01})` }
    : {};

  const backdropStyle: React.CSSProperties = isMobileSoft()
    ? { opacity: 1 - progress * 0.25 }
    : {};

  const isVideo = mt === "video";
  const hasMany = (events?.length ?? 0) > 1;

  // ✅ stile live-drag applicato SOLO su mobile
  const liveDragStyle: React.CSSProperties | undefined = isMobileSoft()
    ? {
        transform: `translate3d(${navX}px, 0, 0)`,
        opacity: navA,
        transition: navSnap
          ? "transform 260ms cubic-bezier(0.22,1,0.36,1), opacity 260ms cubic-bezier(0.22,1,0.36,1)"
          : "none",
        willChange: "transform, opacity",
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Chiudi"
        onClick={requestClose}
        style={backdropStyle}
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          isClosing ? "tsw-backdrop-out" : "tsw-backdrop-in",
        ].join(" ")}
      />

      <div className="absolute inset-0 flex items-center justify-center p-5 md:p-4">
        {/* drag wrapper: si muove solo su mobile (swipe UP close) */}
        <div
          className={snapBack ? "tsw-drag-snap" : ""}
          style={{ ...draggableStyle, willChange: "transform" }}
        >
          {/* ✅ popup */}
          <div
            className={[
              "relative w-[92vw] max-w-[520px]",
              "max-h-[92vh]",
              "rounded-3xl tsw-event-glow",
              isClosing
                ? closingViaSwipe
                  ? "tsw-modal-out-swipe"
                  : "tsw-modal-out"
                : "tsw-modal-in",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            // ✅ gesture SOLO su mobile
            onTouchStart={isMobileSoft() ? onSwipeTouchStart : undefined}
            onTouchMove={isMobileSoft() ? onSwipeTouchMove : undefined}
            onTouchEnd={isMobileSoft() ? onSwipeTouchEnd : undefined}
            style={isMobileSoft() ? ({ touchAction: "pan-x" } as any) : undefined}
          >
            {/* ✅ LIVE-DRAG container: SOLO animazione orizzontale mobile */}
            <div
              className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl"
              style={liveDragStyle}
            >
              {/* Close */}
              <button
                onClick={requestClose}
                className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              >
                Chiudi ✕
              </button>

              {/* ✅ Desktop arrows */}
              {hasMany && !isMobileSoft() && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Evento precedente"
                    className={[
                      "absolute left-3 top-1/2 z-30 -translate-y-1/2",
                      "h-11 w-11 rounded-full",
                      "border border-white/15 bg-black/45 backdrop-blur",
                      "grid place-items-center text-white/90",
                      "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      "hover:bg-black/65 hover:border-white/25 hover:scale-[1.03]",
                      "active:scale-[0.98]",
                    ].join(" ")}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Evento successivo"
                    className={[
                      "absolute right-3 top-1/2 z-30 -translate-y-1/2",
                      "h-11 w-11 rounded-full",
                      "border border-white/15 bg-black/45 backdrop-blur",
                      "grid place-items-center text-white/90",
                      "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      "hover:bg-black/65 hover:border-white/25 hover:scale-[1.03]",
                      "active:scale-[0.98]",
                    ].join(" ")}
                  >
                    ›
                  </button>
                </>
              )}

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
                      "max-h-[60vh] md:max-h-[58vh]",
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

                          <div className="text-xs text-white/60">{event.title}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ✅ Dots indicator (desktop + mobile) */}
              {hasMany && (
                <div className="flex items-center justify-center gap-2 py-3">
                  {events.map((_, i) => {
                    const active = i === safeIndex;
                    return (
                      <button
                        key={events[i]?.id ?? i}
                        type="button"
                        aria-label={`Vai a evento ${i + 1}`}
                        onClick={() => navigateTo(i)}
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          active ? "bg-white" : "bg-white/30 hover:bg-white/45",
                        ].join(" ")}
                      />
                    );
                  })}
                </div>
              )}

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

              /* ✅ transizione wrapper (drag) */
              .tsw-drag-snap {
                transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
              }

              /* ✅ swipe close: SOLO fade + blocco transform (anti-jump) */
              .tsw-modal-out-swipe {
                animation: tswSwipeFadeOut 260ms cubic-bezier(0.22, 1, 0.36, 1)
                  forwards;
                transform: none !important;
              }

              .tsw-modal-out-swipe * {
                transform: none !important;
              }

              @keyframes tswSwipeFadeOut {
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
