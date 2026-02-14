"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import Section from "../components/Section";
import HeroImage from "../components/HeroImage";
import ServiceModal, { type ServiceItem } from "../components/ServiceModal";

import FormatModal, { type FormatItem } from "../components/FormatModal";
import PhotoModal from "../components/PhotoModal";
import type { PhotoItem } from "../components/PhotoModal";

import PhotoDownloadModal, { type DownloadAlbum } from "../components/PhotoDownloadModal";

import EventModal, { type EventItem } from "../components/EventModal";

export default function Home() {
  // ✅ MOBILE NAV
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);

  // Chiudi menu se passo a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false); // md
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Blocca scroll quando menu aperto (solo mobile)
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);
  // ✅ Chiudi menu mobile quando l’utente scrolla (solo < md)
  // Modificato per evitare salti di scroll quando apri le foto
  useEffect(() => {
    if (!mobileNavOpen || activePhoto) return; 
    if (typeof window === "undefined") return;

    const isMobile = () => window.innerWidth < 768; 
    if (!isMobile()) return;

    let ticking = false;

    const onScroll = () => {
      if (!isMobile() || activePhoto) return; 
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        setMobileNavOpen(false);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileNavOpen]);

  // Animazione sezione Servizi (entra/esce)
  useEffect(() => {
    const el = document.getElementById("servizi");
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle("is-visible", entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "0px 0px -30% 0px",
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // --- FOTO GALLERY (cards + popup) ---
  const photos = useMemo<PhotoItem[]>(
    () => [
      { id: "p1", src: "/gallery/1.webp", alt: "Foto evento 01" },
      { id: "p2", src: "/gallery/2.webp", alt: "Foto evento 02" },
      { id: "p3", src: "/gallery/3.webp", alt: "Foto evento 03" },
      { id: "p4", src: "/gallery/4.webp", alt: "Foto evento 04" },
      { id: "p5", src: "/gallery/5.webp", alt: "Foto evento 05" },
      { id: "p6", src: "/gallery/6.webp", alt: "Foto evento 06" },
      { id: "p7", src: "/gallery/7.webp", alt: "Foto evento 07" },
      { id: "p9", src: "/gallery/9.webp", alt: "Foto evento 09" },
      { id: "p10", src: "/gallery/10.webp", alt: "Foto evento 10" },
      { id: "p11", src: "/gallery/11.webp", alt: "Foto evento 11" },
      { id: "p12", src: "/gallery/12.webp", alt: "Foto evento 12" },
      { id: "p13", src: "/gallery/13.webp", alt: "Foto evento 13" },
      { id: "p14", src: "/gallery/14.webp", alt: "Foto evento 14" },
      { id: "p15", src: "/gallery/15.webp", alt: "Foto evento 15" },
      { id: "p16", src: "/gallery/16.webp", alt: "Foto evento 16" },
      { id: "p17", src: "/gallery/17.webp", alt: "Foto evento 17" },
      { id: "p18", src: "/gallery/18.webp", alt: "Foto evento 18" },
      { id: "p19", src: "/gallery/19.webp", alt: "Foto evento 19" },
    ],
    []
  );

  

  const downloadAlbums = useMemo<DownloadAlbum[]>(
    () => [
      {
        date: "14 Giugno 2024",
        venue: "Festa della luce - Calcinate",
        url: "https://photos.app.goo.gl/vrJPMRMgc7SnxxiM7",
      },
      {
        date: "22 Settembre 2024",
        venue: "Festa della luce - Bolgare",
        url: "https://photos.app.goo.gl/bKxFtbZRkCetHVo29",
      },
      {
        date: "1 - 2 Giugno 2025",
        venue: "Festa della luce - Calcinate",
        url: "https://photos.app.goo.gl/XHy7HsyGYfv3zSUZA",
      },
      {
        date: "12 Luglio 2025 ",
        venue: "Notte bianca - Chiosco Cafè - Cologno al Serio",
        url: "https://photos.app.goo.gl/JWoEFtcphZThL83y5",
      },
      {
        date: "10 Ottobre 2025",
        venue: "Festa della luce - Bolgare",
        url: "https://photos.app.goo.gl/3hhrWJmBv4vULgX67",
      },
      {
        date: "31 Dicembre 2025",
        venue: "Emotion 90-2000 - Posto fisso - Palosco",
        url: "https://photos.app.goo.gl/MC2q1sM3Zg5XH7Jd9",
      },
      {
        date: "24 Gennaio 2026",
        venue: "Emotion 90-2000 - Movida beer and food - Erbusco",
        url: "https://photos.app.goo.gl/W25M2LLcdCdq44W3A",
      },
      {
        date: "31 Gennaio 2026",
        venue: "Emotion 90-2000 - Loft Cafè - Rovato",
        url: "https://photos.app.goo.gl/jMowu6Phn36FLUs88",
      },
    ],
    []
  );

  const [openDownloads, setOpenDownloads] = useState(false);

  // --- DATI SERVIZI (per popup) ---
  const services = useMemo<ServiceItem[]>(
    () => [
      {
        id: "duo-dj-vocalist",
        title: "Duo DJ & Vocalist",
        desc: "Show completo: Dj set + Vocalist.",
        detail: `La nostra formazione include due DJ esperti, uno di noi anche vocalist
che aggiunge un tocco unico alla performance con la sua voce,
coinvolgendo il pubblico, creando un’atmosfera magica ed energica.`,
        mediaType: "image",
        mediaSrc: "/brand/foto-servizi-duo-dj.webp",
      },
      {
        id: "organizzazione-eventi",
        title: "Organizzazione Eventi",
        desc: "Concept, timing e gestione serata.",
        detail:
          "Che sia una festa privata, un evento aziendale o una serata in discoteca, pianifichiamo ogni aspetto in base alle tue esigenze e desideri, garantendo un'organizzazione impeccabile.",
        mediaType: "image",
        mediaSrc: "/brand/immagine-eventi.webp",
      },
      {
        id: "audio-luci",
        title: "Audio & Luci",
        desc: "Setup pulito, impatto da club.",
        detail:
          "Disponiamo di un'ottima attrezzatura di base per audio e luci, garantendo un impatto sonoro e visivo di alta qualità. Per esigenze specifiche o eventi di grandi dimensioni, abbiamo la possibilità di affittare ulteriore strumentazione tramite service professionali.",
        mediaType: "video",
        mediaSrc: "/brand/IMG_0289.MP4",
      },
      {
        id: "grafica-pubblicita",
        title: "Grafica & Pubblicità",
        desc: "Locandine, Gestione Grafica e Pubblicitaria.",
        detail:
          "Curiamo l'immagine dell'evento. Dalla creazione di locandine e materiali promozionali alla gestione della pubblicità, ci occupiamo di tutto per assicurare la massima visibilità.",
        mediaType: "image",
        mediaSrc: "/brand/gestione-grafica.webp",
      },
      {
        id: "social-pr",
        title: "Social PR",
        desc: "Presenza e spinta sui social media.",
        detail:
          "Social PR di The Sound Wave | Event PR & Audience Management. Connessioni reali, visibilità concreta, eventi che funzionano.",
        mediaType: "image",
        mediaSrc: "/brand/waven-servizi.webp",
        igUrl: "https://www.instagram.com/waven.social.pr/",
      },
      {
        id: "fotografo",
        title: "Fotografo",
        desc: "Contenuti pro per IG e ADV.",
        detail:
          "Servizio foto, video e riprese drone ad alto impatto social. Contenuti professionali realizzati, editati e pubblicati in tempo reale durante l'evento.",
        mediaType: "image",
        mediaSrc: "/brand/alemembrini.webp",
        igUrl: "https://www.instagram.com/alemembriniph/",
        websiteUrl: "https://alessandromembriniph.com/index.html",
      },
    ],
    []
  );

  const [activeService, setActiveService] = useState<ServiceItem | null>(null);

  // ✅ Palette “waveform”
  const serviceWaveGlows = useMemo(
    () => [
      { g1: "rgba(0, 140, 255, 0.62)", g2: "rgba(0, 255, 220, 0.42)", sh: "rgba(0, 170, 255, 0.70)" },
      { g1: "rgba(0, 210, 255, 0.55)", g2: "rgba(0, 255, 170, 0.35)", sh: "rgba(0, 220, 255, 0.65)" },
      { g1: "rgba(120, 70, 255, 0.55)", g2: "rgba(70, 160, 255, 0.32)", sh: "rgba(140, 90, 255, 0.68)" },
      { g1: "rgba(255, 60, 200, 0.52)", g2: "rgba(180, 70, 255, 0.30)", sh: "rgba(255, 90, 210, 0.62)" },
      { g1: "rgba(255, 120, 0, 0.48)", g2: "rgba(255, 60, 120, 0.28)", sh: "rgba(255, 140, 40, 0.60)" },
      { g1: "rgba(255, 210, 0, 0.42)", g2: "rgba(120, 255, 120, 0.26)", sh: "rgba(255, 220, 70, 0.55)" },
    ],
    []
  );

  // --- DATI FORMAT (per popup) ---
  const formats = useMemo<FormatItem[]>(
    () => [
      {
        id: "emotion",
        title: "Emotion 90/2000",
        logoSrc: "/brand/EMOTION_2.png",
        tracks: [{ title: "Emotion 90/2000", src: "/audio/emotion-90-2000.mp3" }],
      },
      {
        id: "italian-remix-party",
        title: "Italian Remix Party",
        logoSrc: "/brand/italian-remix-logo.svg",
        tracks: [{ title: "Italian Remix 1", src: "/audio/remix-italian-audio.mp3" }],
      },
      {
        id: "the-ritual",
        title: "The Ritual",
        logoSrc: "/brand/the-ritual-logo.svg",
        tracks: [{ title: "The Ritual", src: "/audio/audio-the-ritual.mp3" }],
      },
    ],
    []
  );

  const [activeFormat, setActiveFormat] = useState<FormatItem | null>(null);

  // ====== FOTO carousel refs/helpers ======
  const photoTrackRef = useRef<HTMLDivElement | null>(null);

  const scrollPhotos = (dir: -1 | 1) => {
    const el = photoTrackRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-photo-card='1']");
    const cardW = firstCard ? firstCard.offsetWidth : 360;
    const gap = 16;
    const amount = (cardW + gap) * 2 * dir;

    el.scrollTo({ left: el.scrollLeft + amount, behavior: "smooth" });
  };

  // ====== MODIFICA EVENTI ======
  const events = useMemo<EventItem[]>(
    () => [
      {
        id: "event-1",
        title: "ITALIAN REMIX",
        date: "20 FEBBRAIO 2026",
        venue: "'Loft Cafè - Rovato'",
        imageSrc: "/brand/italian-remix-logo.svg",
        cta: "MAGGIORI DETTAGLI",
        description: "work in progress",
      },
      {
        id: "event-2",
        title: "ITALIAN REMIX PARTY",
        date: "24 Aprile  2026",
        venue: "Quintano",
        imageSrc: "/brand/italian-remix-logo.svg",
        cta: "MAGGIORI DETTAGLI",
        description: "DESCRIZIONE DETTAGLIATA EVENTO...",
      },
      {
        id: "event-3",
        title: "EMOTION 90-2000",
        date: "1 MAGGIO 2026",
        venue: "Quintano",
        imageSrc: "/brand/EMOTION_2.png",
        cta: "MAGGIORI DETTAGLI",
        description: "DESCRIZIONE DETTAGLIATA EVENTO...",
      },
      {
        id: "event-4",
        title: "???????????",
        date: "22-23 MAGGIO 2026",
        venue: "???????????",
        imageSrc: "/brand/EMOTION_2.png",
        cta: "MAGGIORI DETTAGLI",
        description: "DESCRIZIONE DETTAGLIATA EVENTO...",
      },
    ],
    []
  );

  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const eventTrackRef = useRef<HTMLDivElement | null>(null);
  // ✅ ascolta la navigazione eventi dal modal (frecce desktop + swipe mobile)
useEffect(() => {
  const onNavigate = (ev: Event) => {
    const detail = (ev as CustomEvent).detail as { index?: number } | undefined;
    const idx = detail?.index;

    if (typeof idx !== "number") return;
    if (!events?.length) return;

    const next = events[idx] ?? null;
    setActiveEvent(next);
  };

  window.addEventListener("tsw:event:navigate", onNavigate as EventListener);
  return () =>
    window.removeEventListener("tsw:event:navigate", onNavigate as EventListener);
}, [events]);


  const scrollEvents = (dir: -1 | 1) => {
    const el = eventTrackRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-event-card='1']");
    const cardW = firstCard ? firstCard.offsetWidth : 360;
    const gap = 16;
    const amount = (cardW + gap) * 2 * dir;

    el.scrollTo({ left: el.scrollLeft + amount, behavior: "smooth" });
  };

  // ✅ glow card format
  const formatGlow = (id: string) => {
    if (id === "emotion") {
      return { glowL: "rgba(255, 0, 0, 0.85)", glowC: "rgba(255, 0, 0, 0.85)", glowR: "rgba(255, 0, 0, 0.85)" };
    }
    if (id === "italian-remix-party") {
      return { glowL: "rgba(0,166,80,0.65)", glowC: "rgba(255,255,255,0.70)", glowR: "rgba(224,0,42,0.65)" };
    }
    return { glowL: "rgba(124,58,237,0.60)", glowC: "rgba(245,158,11,0.70)", glowR: "rgba(249,115,22,0.60)" };
  };

  const mobileLinks = [
    { label: "Servizi", href: "#servizi" },
    { label: "Format", href: "#format" },
    { label: "Foto", href: "#foto" },
    { label: "Eventi", href: "#eventi" },
    { label: "Chi siamo", href: "#chi-siamo" },
    // ❌ Partner rimosso
    { label: "Contatti", href: "#contatti" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAVBAR (desktop invariata, mobile con hamburger) */}
      <header className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center px-4 py-1">
          {/* Logo: desktop identico, mobile identico (non lo tocchiamo) */}
          <a href="#hero" className="flex items-center justify-center">
            <Image
              src="/brand/tsw-logo.svg"
              alt="The Sound Wave"
              width={400}
              height={400}
              className="h-16 sm:h-28 w-auto object-contain"
              priority
            />
          </a>

          {/* DESKTOP MENU (md+) — Partner rimosso */}
          <nav className="hidden justify-center gap-5 text-sm text-zinc-300 md:flex whitespace-nowrap">
            <a className="hover:text-white" href="#servizi">Servizi</a>
            <a className="hover:text-white" href="#format">Format</a>
            <a className="hover:text-white" href="#foto">Foto</a>
            <a className="hover:text-white" href="#eventi">Eventi</a>
            <a className="hover:text-white" href="#chi-siamo">Chi siamo</a>
            <a className="hover:text-white" href="#contatti">Contatti</a>
          </nav>

          {/* DESKTOP CTA (md+) — identico */}
          <a
            href="#contatti"
            className="hidden md:inline-flex justify-self-end w-fit whitespace-nowrap rounded-xl bg-white px-3 sm:px-4 py-2 text-sm font-semibold text-black"
          >
            Contatta
          </a>

          {/* MOBILE HAMBURGER (solo < md) */}
          <button
  type="button"
  aria-label={mobileNavOpen ? "Chiudi menu" : "Apri menu"}
  aria-expanded={mobileNavOpen}
  onClick={() => setMobileNavOpen((v) => !v)}
  className={[
    "md:hidden col-start-3 justify-self-end",
    "h-11 w-11 rounded-xl",
    "border border-white/15 bg-black/55 backdrop-blur",
    "grid place-items-center text-white/90",
    "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:scale-[1.04] active:scale-[0.98]",
  ].join(" ")}
>

            {/* Icona hamburger / X */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {mobileNavOpen ? (
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE DROPDOWN (Apple-like) */}
        {mobileNavOpen && (
          <div className="md:hidden">
            {/* overlay */}
            <button
              aria-label="Chiudi menu"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/45"
            />
            {/* panel */}
            <div className="relative z-50 px-3 pb-3">
              <div
                className={[
                  "mt-2 overflow-hidden rounded-2xl",
                  "border border-white/10 bg-black/80 backdrop-blur",
                  "shadow-[0_0_40px_rgba(0,0,0,0.55)]",
                ].join(" ")}
              >
                <div className="px-3 py-3">
                  <div className="grid gap-1">
                    {mobileLinks.map((l) => (
  <a
  key={l.href}
  href={l.href}
  onClick={() => setMobileNavOpen(false)}
  className={[
    "flex items-center justify-center text-center",
    "rounded-xl px-3 py-3",
    "text-[15px] font-medium text-zinc-200",
    "bg-white/0 hover:bg-white/5 active:bg-white/10",
    "transition",
  ].join(" ")}
>
  <span>{l.label}</span>
</a>

))}

                  </div>

                  <div className="mt-3 h-px bg-white/10" />

                  {/* CTA nel menu mobile */}
                  <a
                    href="#contatti"
                    onClick={() => setMobileNavOpen(false)}
                    className={[
                      "mt-3 inline-flex w-full items-center justify-center",
                      "rounded-xl bg-white px-4 py-3",
                      "text-sm font-semibold text-black",
                      "transition active:scale-[0.99]",
                    ].join(" ")}
                  >
                    Contatta
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 1) HERO */}
     <section
  id="hero"
  className="pt-32 sm:pt-56 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-20"
>

        <div className="tsw-fade-up relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4 sm:p-10 backdrop-blur">

          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="tsw-fade-up relative grid gap-6 sm:gap-10 lg:grid-cols-2 lg:items-center">
  <div className="flex flex-col items-center md:items-start text-center md:text-left">
    <div className="text-sm text-zinc-300/80">THE SOUND WAVE • DJ & ENTERTAINMENT</div>


              <div className="relative">
                <div aria-hidden className="absolute -inset-6 rounded-full bg-purple-500/20 blur-3xl" />
                <h1 className="relative mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-center md:text-left">
  PLEASE DON'T STOP <br className="md:hidden" /> THE MUSIC
</h1>

              </div>

             <p className="mt-4 max-w-xl mx-auto md:mx-0 text-zinc-300 text-center md:text-left">
Dj Set ed Eventi che fanno vibrare il pubblico</p>

              <div className="mt-7 sm:mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="#format"
                  className={[
                    "group relative inline-flex items-center justify-center",
                    "overflow-hidden rounded-2xl",
                    "border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white",
                    "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:-translate-y-0.5 hover:border-white/20",
                    "hover:shadow-[0_0_28px_rgba(59,130,246,0.85)]",
                    "active:translate-y-[1px] active:scale-[0.985]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                    "select-none",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                  >
                    <span className="absolute inset-0 rounded-2xl bg-blue-400/65 blur-xl" />
                    <span className="absolute inset-0 rounded-2xl bg-cyan-400/55 blur-xl" />
                  </span>

                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-10 -top-10 h-20 rotate-12 bg-white/10 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="relative z-10">Scopri i format</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-blue-500/20" />
                <HeroImage src="/brand/wallen-gianluk-home.webp" alt="Wallen & Gianluk - The Sound Wave" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) SERVIZI */}
      <Section id="servizi" title="Servizi">
        <div className="mx-auto max-w-3xl">
          <ul className="grid gap-4 md:grid-cols-2">
            {services.map((s, i) => {
              const c = serviceWaveGlows[i % serviceWaveGlows.length];
              return (
                <li
                  key={s.id}
                  style={
                    {
                      ["--d" as any]: `${i * 140}ms`,
                      ["--g1" as any]: c.g1,
                      ["--g2" as any]: c.g2,
                      ["--sh" as any]: c.sh,
                    } as React.CSSProperties
                  }
                  onClick={() => setActiveService(s)}
                  className={[
                    "tsw-stagger group cursor-pointer relative overflow-hidden rounded-2xl",
                    "border border-white/10 bg-white/5 p-5",
                    "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:-translate-y-1 hover:border-white/20",
                    "hover:shadow-[0_0_28px_var(--sh)]",
                    "active:translate-y-[1px] active:scale-[0.985]",
                    "select-none",
                  ].join(" ")}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                  >
                    <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "var(--g1)" }} />
                    <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "var(--g2)" }} />
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-14 -top-12 h-24 rotate-12 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "rgba(255,255,255,0.10)" }}
                  />

                  <div className="relative z-10">
                    <div className="text-base font-semibold tracking-tight text-center md:text-left">
  {s.title}
</div>

<p className="mt-2 text-sm text-zinc-300 line-clamp-1 text-center md:text-left">
  {s.desc}
</p>

                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <ServiceModal open={!!activeService} onClose={() => setActiveService(null)} service={activeService} />
      </Section>

      {/* 3) FORMAT */}
      <Section id="format" title="Format">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { id: "emotion", title: "Emotion 90/2000", logo: "/brand/EMOTION_2.png", logoClass: "h-20" },
            { id: "italian-remix-party", title: "Italian Remix Party", logo: "/brand/italian-remix-logo.svg", logoClass: "h-28" },
            { id: "the-ritual", title: "The Ritual", logo: "/brand/the-ritual-logo.svg", logoClass: "h-36" },
          ].map((f) => {
            const g = formatGlow(f.id);
            return (
              <div
                key={f.title}
                onClick={() => {
                  const found = formats.find((x) => x.id === f.id) ?? null;
                  setActiveFormat(found);
                }}
                style={
                  {
                    ["--glowL" as any]: g.glowL,
                    ["--glowC" as any]: g.glowC,
                    ["--glowR" as any]: g.glowR,
                  } as React.CSSProperties
                }
                className={[
                  "group cursor-pointer relative overflow-hidden rounded-2xl border border-white/10 bg-black p-6",
                  "flex flex-col items-center text-center",
                  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-1 hover:border-white/20",
                  "hover:shadow-[0_0_26px_var(--glowC),0_0_34px_var(--glowL),0_0_34px_var(--glowR)]",
                  "active:translate-y-[1px] active:scale-[0.985]",
                  "select-none",
                ].join(" ")}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `
                        radial-gradient(120% 140% at 0% 50%, var(--glowL) 0%, transparent 62%),
                        radial-gradient(140% 160% at 50% 50%, var(--glowC) 0%, transparent 66%),
                        radial-gradient(120% 140% at 100% 50%, var(--glowR) 0%, transparent 62%)
                      `,
                      opacity: 0.18,
                      filter: "blur(18px)",
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(0,0,0,0.22)" }} />
                </div>

                <div className="relative z-10 flex w-full flex-1 items-center justify-center">
                  <div className={["relative w-full max-w-[260px]", f.logoClass].join(" ")}>
                    <Image
                      src={f.logo}
                      alt={f.title}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={false}
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-6 text-lg font-semibold">{f.title}</div>
              </div>
            );
          })}
        </div>

        <FormatModal open={!!activeFormat} onClose={() => setActiveFormat(null)} format={activeFormat} />
      </Section>

      {/* 4) FOTO */}
      <Section id="foto" title="Foto" subtitle="Gallery eventi">
        <div className="relative px-4 sm:px-12">
          <button
            aria-label="Indietro"
            onClick={() => scrollPhotos(-1)}
            className={[
              "hidden sm:grid",
              "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
              "h-11 w-11 rounded-full",
              "border border-white/15 bg-black/55 backdrop-blur",
              "place-items-center text-white/90",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:scale-[1.06]",
              "active:scale-[0.98]",
            ].join(" ")}
          >
            ‹
          </button>

          <button
            aria-label="Avanti"
            onClick={() => scrollPhotos(1)}
            className={[
              "hidden sm:grid",
              "absolute -right-2 top-1/2 -translate-y-1/2 z-10",
              "h-11 w-11 rounded-full",
              "border border-white/15 bg-black/55 backdrop-blur",
              "place-items-center text-white/90",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:scale-[1.06]",
              "active:scale-[0.98]",
            ].join(" ")}
          >
            ›
          </button>

          <div
            ref={photoTrackRef}
            style={{ overflowY: "visible" }}
            className={[
              "tsw-hide-scrollbar",
              "flex gap-4 overflow-x-auto",
              "scroll-smooth",
              "px-4 sm:px-12 py-5 sm:py-6",
              "snap-x snap-mandatory",
            ].join(" ")}
          >
          {photos.map((p, idx) => (
  <button
    key={p.id}
    type="button"
    data-photo-card={idx === 0 ? "1" : undefined}
    // FIX: e.preventDefault() e blur() impediscono il salto della pagina
    onClick={(e) => {
      e.preventDefault();
      e.currentTarget.blur();
      setActivePhoto(p);
    }}
    className={[
      "snap-start shrink-0 text-left",
      "group cursor-pointer relative rounded-2xl border border-white/10 bg-black",
      "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "hover:-translate-y-1 hover:border-white/20",
      "active:translate-y-[1px] active:scale-[0.985]",
      "select-none",
      "w-[82vw] sm:w-[46vw] md:w-[24%]",
    ].join(" ")}
  >
    <div className="relative overflow-hidden rounded-2xl bg-black">
      {/* MOBILE */}
      <div className="md:hidden flex items-center justify-center px-2 py-3">
        <Image
          src={p.src}
          alt={p.alt ?? "Foto evento"}
          width={800} // Ridotto per performance mobile
          height={450}
          className="w-full h-auto max-h-[220px] object-contain"
        />
      </div>
      {/* DESKTOP */}
      <div className="hidden md:block relative aspect-[16/10] w-full">
        <Image
          src={p.src}
          alt={p.alt ?? "Foto evento"}
          fill
          className="object-cover"
          sizes="25vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center md:hidden">
        <div className="rounded-full bg-black/55 px-3 py-1 text-[12px] text-white/90 backdrop-blur border border-white/10">
          ← scorri →
        </div>
      </div>
    </div>
  </button>
))}
          </div>
        </div>

        <div className="mt-7 sm:mt-8 flex justify-center">
          <button
            type="button"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white px-7 py-3 font-semibold text-black transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.45)] active:translate-y-[1px] active:scale-[0.985] select-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenDownloads(true);
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
            >
              <span className="absolute inset-0 rounded-2xl bg-white/45 blur-xl" />
              <span className="absolute inset-0 rounded-2xl bg-white/20 blur-2xl" />
            </span>
            <span className="relative z-10">Foto eventi • Download</span>
          </button>
        </div>

        <PhotoModal open={!!activePhoto} onClose={() => setActivePhoto(null)} photo={activePhoto} photos={photos as any} />
        <PhotoDownloadModal open={openDownloads} onClose={() => setOpenDownloads(false)} albums={downloadAlbums} />
      </Section>

     {/* 5) EVENTI */}
<Section id="eventi" title="Eventi" subtitle="Prossimi eventi">
  <div className="relative px-4 sm:px-12">
    <button
      aria-label="Indietro"
      onClick={() => scrollEvents(-1)}
      className={[
        "hidden sm:grid",
        "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
        "h-11 w-11 rounded-full",
        "border border-white/15 bg-black/55 backdrop-blur",
        "place-items-center text-white/90",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:scale-[1.06]",
        "active:scale-[0.98]",
      ].join(" ")}
    >
      ‹
    </button>

    <button
      aria-label="Avanti"
      onClick={() => scrollEvents(1)}
      className={[
        "hidden sm:grid",
        "absolute -right-2 top-1/2 -translate-y-1/2 z-10",
        "h-11 w-11 rounded-full",
        "border border-white/15 bg-black/55 backdrop-blur",
        "place-items-center text-white/90",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:scale-[1.06]",
        "active:scale-[0.98]",
      ].join(" ")}
    >
      ›
    </button>

    <div
  ref={eventTrackRef}
  style={{ overflowY: "visible" }} // ✅ così il glow non viene tagliato
  className={[
    "tsw-hide-scrollbar",
    "flex gap-4 overflow-x-auto",
    "scroll-smooth",
    "px-10",
    "py-10",              // ✅ più spazio sopra/sotto per il glow
    "snap-x snap-mandatory",
  ].join(" ")}
>
      {events.map((ev, idx) => (
        <button
          key={ev.id}
          data-event-card={idx === 0 ? "1" : undefined}
          onClick={() => setActiveEvent(ev)}
          className={[
            "snap-start shrink-0 text-left",
            "group cursor-pointer relative rounded-2xl bg-black overflow-visible",
            // bordo: quasi invisibile su mobile, identico su md+
            "border border-white/5 md:border-white/10",
            "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:-translate-y-1 hover:border-white/20",
            // ✅ neon bianco on hover
            "hover:shadow-[0_0_26px_rgba(255,255,255,0.28),0_0_44px_rgba(255,255,255,0.16)]",
            "active:translate-y-[1px] active:scale-[0.985]",
            "select-none",
            // card più piccola su mobile
            "w-[50vw] sm:w-[36vw] md:w-[24%] lg:w-[30%]",
          ].join(" ")}
        >
          {/* ✅ overlay glow interno (leggero bianco dentro) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `
                  radial-gradient(140% 160% at 50% 35%, rgba(255,255,255,0.85) 0%, transparent 66%)
                `,
                opacity: 0.14,
                filter: "blur(18px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)" }}
            />
          </div>

          {/* ✅ inner wrapper: taglia SOLO contenuti, non il glow */}
<div className="relative overflow-hidden rounded-2xl">
  <div className="relative mx-4 mt-4 aspect-[2480/3508] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-white/10 bg-black">
    <Image
      src={ev.imageSrc}
      alt={ev.title}
      fill
      className="object-contain object-center"
      sizes="(max-width: 768px) 84vw, (max-width: 1024px) 46vw, 33vw"
      priority={false}
    />
  </div>

  <div className="relative px-4 pt-4 pb-5">
    <div className="text-xs text-zinc-400">
      {ev.date} • {ev.venue}
    </div>

    <div className="mt-1 text-lg font-semibold tracking-tight text-white">
      {ev.title}
    </div>

    <p className="mt-2 text-sm text-zinc-300">{ev.cta}</p>

    <span
      className={[
        "absolute bottom-4 right-4",
        "text-zinc-400",
        "transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-hover:translate-x-1 group-hover:text-white/70",
      ].join(" ")}
    >
      →
    </span>
  </div>
</div>

        </button>
      ))}
    </div>
  </div>

  <EventModal
    open={!!activeEvent}
    onClose={() => setActiveEvent(null)}
    event={activeEvent}
    events={events}
  />
</Section>


     {/* 6) CHI SIAMO */}
<Section id="chi-siamo" title="Chi siamo">
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl"
    />

    <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-12 lg:items-center">
      {/* IMMAGINE */}
      <div className="lg:col-span-5">
        <div className="group relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-3xl opacity-60 blur-xl"
            style={{ background: "rgba(255,255,255,0.12)" }}
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/brand/chi-siamo.webp"
                alt="The Sound Wave DJs"
                fill
                className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* TESTI + LOGHI (centrati su mobile + desktop) */}
      <div className="lg:col-span-7 flex flex-col items-center text-center">
        <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight">
          The Sound Wave
        </h3>

        <p className="mt-5 sm:mt-6 text-zinc-300 leading-relaxed">
          The Sound Wave è un progetto nato dall’unione di due professionisti
          dell’intrattenimento con l’obiettivo di portare eventi musicali
          strutturati, coinvolgenti.<br />
          DJ Gianluk - DJ & Vocalist, la sua forza è il coinvolgimento del
          pubblico, l’uso della voce e la capacità di leggere la pista e
          trasformare la musica in spettacolo.<br />
          DJ Wallen - DJ orientato alla costruzione musicale dell’evento e alla
          creazione di veri e propri viaggi sonori.<br />
          Entrambi curano lo sviluppo del progetto, e l'ideazione di nuovi
          format.
        </p>

        <p className="mt-4 text-zinc-400 leading-relaxed">
          Dall’organizzazione completa dell’evento alla gestione dell’atmosfera
          musicale e visiva, ogni dettaglio viene curato per creare momenti
          memorabili e coinvolgenti.
        </p>

        {/* LOGHI: affiancati, più grandi, riquadro QUADRATO, bordi arrotondati */}
        <div className="mt-7 sm:mt-8 flex items-center justify-center gap-5 sm:gap-6">
          <div className="group relative">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="relative h-full w-full">
                <Image
                  src="/brand/wallen-logo.svg"
                  alt="DJ Wallen"
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="relative h-full w-full">
                <Image
                  src="/brand/gianluk-logo.svg"
                  alt="DJ Gianluk"
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /TESTI + LOGHI */}
    </div>
  </div>
</Section>


    {/* 8) CONTATTI */}
<Section id="contatti" title="Contatti">
  <div className="grid gap-4 md:grid-cols-3">
    <a
      href="https://wa.me/393516854933"
      target="_blank"
      className={[
        "group relative flex flex-col items-center justify-center text-center gap-3",
        "rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-white/20",
        "active:translate-y-[1px] active:scale-[0.985]",
        "select-none",
      ].join(" ")}
    >
      <div className="relative h-10 w-10">
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          fill
          className="object-contain"
          sizes="40px"
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          WhatsApp
          <span className="text-zinc-400 transition group-hover:translate-x-1">→</span>
        </div>
        <div className="text-sm text-zinc-400">+39 3516854933</div>
      </div>
    </a>

    <a
      href="mailto:thesoundwave25@gmail.com"
      className={[
        "group relative flex flex-col items-center justify-center text-center gap-3",
        "rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border border-white/20",
        "active:translate-y-[1px] active:scale-[0.985]",
        "select-none",
      ].join(" ")}
    >
      <div className="relative h-10 w-10">
        <Image
          src="/icons/email.png"
          alt="Email"
          fill
          className="object-contain"
          sizes="40px"
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          Email
          <span className="text-zinc-400 transition group-hover:translate-x-1">→</span>
        </div>
        <div className="text-sm text-zinc-400">thesoundwave25@gmail.com</div>
      </div>
    </a>

    <a
      href="https://www.instagram.com/the.sound_wave/"
      target="_blank"
      className={[
        "group relative flex flex-col items-center justify-center text-center gap-3",
        "rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-white/20",
        "active:translate-y-[1px] active:scale-[0.985]",
        "select-none",
      ].join(" ")}
    >
      <div className="relative h-10 w-10">
        <Image
          src="/icons/instagram.png"
          alt="Instagram"
          fill
          className="object-contain"
          sizes="40px"
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          Instagram
          <span className="text-zinc-400 transition group-hover:translate-x-1">→</span>
        </div>
        <div className="text-sm text-zinc-400">the.sound_wave</div>
      </div>
    </a>
  </div>

  <div className="mt-7 sm:mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 text-center">
    <div className="text-base sm:text-xl font-semibold leading-relaxed">
      Una squadra. Un’energia. Un’esperienza completa.<br />
      DJ, DJ e Vocalist, Social PR e Fotografo, lavoriamo insieme per creare eventi che funzionano davvero.<br />
      Porta The Sound Wave nel tuo evento.
    </div>

    {/* ✅ Loghi: una riga anche su mobile (come desktop) */}
    <div className="mt-6 flex flex-nowrap justify-center gap-2 sm:gap-6">
      {/* ✅ SOLO QUI: Gianluk sm:w-36 come gli altri */}
      <div className="relative shrink-0 h-12 w-20 sm:h-16 sm:w-36">
        <Image
          src="/brand/gianluk-logo.svg"
          alt="logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 80px, 144px"
        />
      </div>

      <div className="relative shrink-0 h-12 w-20 sm:h-16 sm:w-36">
        <Image
          src="/brand/wallen-logo.svg"
          alt="logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 80px, 144px"
        />
      </div>

      <div className="relative shrink-0 h-12 w-20 sm:h-16 sm:w-36">
        <Image
          src="/brand/waven-logo.svg"
          alt="logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 80px, 144px"
        />
      </div>

      <div className="relative shrink-0 h-12 w-20 sm:h-16 sm:w-36">
        <Image
          src="/brand/alemembrini-logo.svg"
          alt="logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 80px, 144px"
        />
      </div>
    </div>
  </div>
</Section>



      <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12 text-zinc-500">
        © {new Date().getFullYear()} The Sound Wave
      </footer>

      <style jsx global>{`
        .tsw-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .tsw-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
