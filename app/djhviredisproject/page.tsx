"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Il progetto", id: "progetto" },
  { label: "Partner ufficiali", id: "partner" },
  { label: "I DJ", id: "dj" },
  { label: "Foto", id: "foto" },
  { label: "Eventi", id: "eventi" },
  { label: "Il presidente", id: "presidente" },
  { label: "Formazione", id: "formazione" },
];

const heroImages = [
  "/djh-foto-hero/hero-1.webp",
  "/djh-foto-hero/hero-2.webp",
  "/djh-foto-hero/hero-3.webp",
  "/djh-foto-hero/hero-4.webp",
  "/djh-foto-hero/hero-5.webp",
  "/djh-foto-hero/hero-6.webp",
  "/djh-foto-hero/hero-7.webp",
  "/djh-foto-hero/hero-8.webp",
  "/djh-foto-hero/hero-9.webp",
  "/djh-foto-hero/hero-10.webp",
  "/djh-foto-hero/hero-11.webp",
  "/djh-foto-hero/hero-12.webp",
  "/djh-foto-hero/hero-13.webp",
  "/djh-foto-hero/hero-14.webp",
];

const formazioneImages = [
  "/formazione-djh/formazione-1.webp",
  "/formazione-djh/formazione-2.webp",
  "/formazione-djh/formazione-3.webp",
  "/formazione-djh/formazione-5.webp",
  "/formazione-djh/formazione-6.webp",
  "/formazione-djh/formazione-7.webp",
  
];
const djCards = [
  {
    name: "DJ 1",
    image: "/djh-foto-hero/hero-1.webp",
    video: "/video-djh/dj-1.mp4",
  },
  {
    name: "DJ 2",
    image: "/djh-foto-hero/hero-2.webp",
    video: "/video-djh/dj-2.mp4",
  },
  {
    name: "DJ 3",
    image: "/djh-foto-hero/hero-3.webp",
    video: "/video-djh/dj-3.mp4",
  },
  {
    name: "DJ 4",
    image: "/djh-foto-hero/hero-4.webp",
    video: "/video-djh/dj-4.mp4",
  },
  {
    name: "DJ 5",
    image: "/djh-foto-hero/hero-5.webp",
    video: "/video-djh/dj-5.mp4",
  },
  {
    name: "DJ 6",
    image: "/djh-foto-hero/hero-6.webp",
    video: "/video-djh/dj-6.mp4",
  },
];


const galleryPhotos = [
  "/foto-djh/foto-1.webp",
  "/foto-djh/foto-2.webp",
  "/foto-djh/foto-3.webp",
  "/foto-djh/foto-4.webp",
  "/foto-djh/foto-5.webp",
  "/foto-djh/foto-6.webp",
  "/foto-djh/foto-7.webp",
  "/foto-djh/foto-8.webp",
  "/foto-djh/foto-9.webp",
  "/foto-djh/foto-10.webp",
  "/foto-djh/foto-11.webp",
  "/foto-djh/foto-12.webp",
  "/foto-djh/foto-13.webp",
  "/foto-djh/foto-14.webp",
  "/foto-djh/foto-15.webp",
  "/foto-djh/foto-16.webp",
  "/foto-djh/foto-17.webp",
  "/foto-djh/foto-18.webp",
  "/foto-djh/foto-19.webp",
  "/foto-djh/foto-20.webp",
  "/foto-djh/foto-21.webp",
  "/foto-djh/foto-22.webp",
  "/foto-djh/foto-23.webp",
  "/foto-djh/foto-24.webp",
  "/foto-djh/foto-25.webp",

// modifica eventi //
];
const djhEvents = [

  {
    title: "DJH in Tour 4 TAPPA",
    place: "DJH in Tour 4 TAPPA",
    date: "7 giugno - ore 14.00",
    location: "Campo sportivo e laghetto - via G. Matteotti - Pontoglio",
    image: "/locandine-djh/tappa-4.webp",
    description:
      "DJH – VI.RE.DIS. Project “La musica che spacca!” arriva con la 4ª tappa ufficiale: domenica 7 giugno dalle 14:00 alle 18:00 a “Il sorriso oltre l’ostacolo” presso il Campo Sportivo e Laghetto di Pontoglio (BS). Un pomeriggio di musica, inclusività e divertimento insieme a Team Life, Lions Club Brescia Teamlife, The Sound Wave e VI.RE.DIS. Project. “La differenza che fa ballare”.",
  },
  {
    title: "DJH in Tour 5 TAPPA",
    place: "DJH in Tour 5 TAPPA",
    date: "13 giugno - ore 17.00 - 18.30",
    location: "Oratorio S.Maria Immacolata - via Verdi 2/A - Mornico al Serio",
    image: "/locandine-djh/tappa-5.webp",
    description:
      "“La musica che spacca!” torna con la 5ª tappa ufficiale: sabato 13 giugno 2026 dalle 17:00 alle 18:30 alla Festa POGI, presso l’Oratorio S. Maria Immacolata di Mornico al Serio (BG). Un evento di musica, inclusività e divertimento insieme a POGI, The Sound Wave e VI.RE.DIS. Project. “La differenza che fa ballare",
  },
  {
    title: "DJH in Tour 6 TAPPA",
    place: "DJH in Tour 6 TAPPA",
    date: "2 al 10 luglio - ore 20.15 - 21.00",
    location: "Arena Campo Marte - via Campo di Marte - Brescia",
    image: "/locandine-djh/tappa-6.webp",
    description:
      "“La musica che spacca!” arriva al Brescia Summer Music con la 6ª tappa ufficiale: 2, 4, 6, 8, 9 e 10 luglio all’Arena Campo Marte di Brescia. Sei serate dedicate a musica, inclusività e divertimento insieme a The Sound Wave, Radio Bruno Media Partner e gli official DJ’s del progetto DJH, con il supporto di Bar.it ed Emergenza Creativa. “La differenza che fa ballare”.",
  }, 
];

const partnerPublications = [
  {
    image: "/partner-djh/pubblicazione-1.webp",
    url: "#",
  },
  
];

export default function DJHVireDisProjectPage() {
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [activeFormazioneImage, setActiveFormazioneImage] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDjIndex, setActiveDjIndex] = useState<number | null>(null);

  const [galleryPage, setGalleryPage] = useState(0);
const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

const [eventsPage, setEventsPage] = useState(0);
const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
const [partnerPage, setPartnerPage] = useState(0);
const partnerTouchStart = useRef<{ x: number; y: number } | null>(null);

const publicationsPerPage = 6;
const totalPartnerPages = Math.ceil(
  partnerPublications.length / publicationsPerPage
);
const visiblePartnerPublications = partnerPublications.slice(
  partnerPage * publicationsPerPage,
  partnerPage * publicationsPerPage + publicationsPerPage
);
const [eventImageZoomOpen, setEventImageZoomOpen] = useState(false);
const eventTouchStart = useRef<{ x: number; y: number } | null>(null);
const photoTouchStart = useRef<{ x: number; y: number } | null>(null);

const eventsPerPage = 4;
const totalEventsPages = Math.ceil(djhEvents.length / eventsPerPage);
const visibleEvents = djhEvents.slice(
  eventsPage * eventsPerPage,
  eventsPage * eventsPerPage + eventsPerPage
);

const photosPerPage = 12;
const totalGalleryPages = Math.ceil(galleryPhotos.length / photosPerPage);
const visibleGalleryPhotos = galleryPhotos.slice(
  galleryPage * photosPerPage,
  galleryPage * photosPerPage + photosPerPage
);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
  const interval = window.setInterval(() => {
    setActiveFormazioneImage(
      (current) => (current + 1) % formazioneImages.length
    );
  }, 3600);

  return () => window.clearInterval(interval);
}, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#17112d] text-white">
      <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#17112d]/75 px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <a href="#hero" className="flex items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1">
              <Image
                src="/djh-foto-hero/viredis-logo.svg"
                alt="The Sound Wave"
                fill
                className="object-contain p-1"
              />
            </div>

            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1">
              <Image
                src="/djh-foto-hero/djh_official.svg"
                alt="Vi.Re.Dis."
                fill
                className="object-contain p-1"
              />
            </div>

            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1">
              <Image
                src="/brand/tsw-logo.svg"
                alt="DJH"
                fill
                className="object-contain p-1"
              />
            </div>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-10 text-base text-zinc-300 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="font-['Comic_Sans_MS'] text-base transition duration-300 hover:text-white hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.95)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
           <a
  href="/"
  target="_blank"
  rel="noopener noreferrer"
  className="group hidden flex-col items-center justify-center md:flex"
>
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 transition duration-300 group-hover:border-pink-400/50 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]">
                <Image
                  src="/brand/tsw-logo.svg"
                  alt="The Sound Wave"
                  fill
                  className="object-contain p-1"
                />
              </div>

              <span className="font-['Comic_Sans_MS'] mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400 transition duration-300 group-hover:text-white">
                Official Website
              </span>
            </a>

            <button
              type="button"
              aria-label="Apri menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
            >
              <div className="flex flex-col items-center justify-center gap-[5px]">
                <span
                  className={[
                    "h-[2px] w-5 rounded-full bg-white transition-all duration-300",
                    mobileMenuOpen ? "translate-y-[7px] rotate-45" : "",
                  ].join(" ")}
                />

                <span
                  className={[
                    "h-[2px] w-5 rounded-full bg-white transition-all duration-300",
                    mobileMenuOpen ? "opacity-0" : "",
                  ].join(" ")}
                />

                <span
                  className={[
                    "h-[2px] w-5 rounded-full bg-white transition-all duration-300",
                    mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "",
                  ].join(" ")}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xl md:hidden">
          <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="font-['Comic_Sans_MS'] text-2xl font-semibold tracking-tight text-white transition duration-300 hover:text-pink-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <section
        id="hero"
        className="relative flex min-h-screen items-center scroll-mt-24 px-6 pt-44 pb-20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(236,72,153,0.24),transparent_34%),radial-gradient(circle_at_75%_55%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_55%_85%,rgba(132,204,22,0.12),transparent_32%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="group relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2 shadow-[0_0_60px_rgba(236,72,153,0.16)]">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.85), rgba(14,165,233,0.65), rgba(132,204,22,0.55))",
                }}
              />

              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#17112d] max-h-[520px]">
                {heroImages.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`DJH in tour ${index + 1}`}
                    fill
                    priority={index === 0}
                    className={[
  "object-contain object-center",
  "transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
  index === activeFormazioneImage
    ? "opacity-100"
    : "opacity-0",
].join(" ")}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                ))}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#17112d]/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          <div className="text-center lg:col-span-5 lg:text-left">
            <p className="text-sm uppercase tracking-[0.45em] text-pink-400">
              DJH VI.RE.DIS. PROJECT
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">
              La musica che spacca
            </h1>

            <p className="font-['Comic_Sans_MS'] mt-6 text-lg leading-relaxed text-zinc-300">
              Un progetto musicale, inclusivo e coinvolgente. Una nuova esperienza
              firmata Vi.Re.Dis. e The Sound Wave, che aiuta i ragazzi a esprimersi nel mondo del Djing.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start">
              <a
                href="#progetto"
                className="font-['Comic_Sans_MS'] rounded-full border border-fuchsia-400/30 bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:border-fuchsia-300/70 hover:shadow-[0_0_28px_rgba(236,72,153,0.75),0_0_70px_rgba(236,72,153,0.35)] active:scale-[0.98]"
              >
                Scopri il progetto
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="progetto" className="scroll-mt-24 px-6 pt-8 pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10 lg:grid-cols-12 lg:items-center">
          {/* IMMAGINE */}
          <div className="mx-auto w-full max-w-[320px] lg:col-span-4">
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(14,165,233,0.55), rgba(132,204,22,0.45))",
                }}
              />

              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/djh-foto-hero/djh-progetto.webp"
                  alt="DJH Project"
                  width={1200}
                  height={1400}
                  className="h-auto w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* TESTO */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
              Vi.Re.Dis Project
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              DJH - La musica che spacca
            </h2>

            <p className="font-['Comic_Sans_MS'] mt-6 text-lg leading-relaxed text-zinc-300">
              DJH è un progetto che unisce musica, inclusione e crescita personale,
              dando ai ragazzi la possibilità di diventare protagonisti attraverso
              il mondo del DJing. Tra formazione, creatività ed esibizioni dal vivo,
              il percorso trasforma una passione in un’esperienza reale di
              condivisione, divertimento e valorizzazione delle proprie capacità.
              Ciò che spesso viene chiamato disabilità, qui diventa energia, talento e un modo unico di vivere la musica.”
            </p>

            {/* LOGHI */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
              <div className="group relative">
                <div className="relative h-30 w-30 rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 group-hover:border-pink-400/50 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]">
                  <Image
                    src="/djh-foto-hero/djh_official.svg"
                    alt="DJH"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <div className="group relative">
                <div className="relative h-30 w-30 rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 group-hover:border-pink-400/50 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]">
                  <Image
                    src="/djh-foto-hero/viredis-logo.svg"
                    alt="Vi.Re.Dis."
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <div className="group relative">
                <div className="relative h-30 w-30 rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 group-hover:border-pink-400/50 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]">
                  <Image
                    src="/brand/tsw-logo.svg"
                    alt="The Sound Wave"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
           <section id="partner" className="scroll-mt-4 px-6 pt-8 pb-24">
  <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10">
    <div className="text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
        Partner ufficiali
      </p>

      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
        I nostri partner
      </h2>
    </div>

    <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="mx-auto w-full max-w-[320px] lg:col-span-4">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(14,165,233,0.55), rgba(132,204,22,0.45))",
            }}
          />

          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#17112d] p-8">
            <Image
              src="/partner-djh/radio-bruno-logo1.svg"
              alt="Radio Bruno"
              fill
              className="object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 24vw"
            />
          </div>
        </div>
      </div>

      <div className="text-center lg:col-span-8 lg:text-left">
        <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          MEDIA PARTNER RADIO BRUNO 
        </h3>

        <p className="font-['Comic_Sans_MS'] mt-5 text-lg leading-relaxed text-zinc-300">
          Radio Bruno sostiene ufficialmente il progetto DJH – “La musica che spacca!”, contribuendo a dare voce a un’iniziativa dove musica, inclusività e condivisione diventano strumenti di aggregazione e crescita. Una collaborazione importante che aiuta il progetto a raggiungere sempre più persone, valorizzando il talento, l’energia e l’unicità dei ragazzi protagonisti di DJH.
        </p>
      </div>
    </div>

    <div className="mt-16 text-center">
      <h3 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
        Le pubblicazioni
      </h3>
    </div>

    <div
      className="mt-10"
      onTouchStart={(e) => {
        const touch = e.touches[0];
        partnerTouchStart.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }}
      onTouchEnd={(e) => {
        if (!partnerTouchStart.current) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - partnerTouchStart.current.x;
        const deltaY = touch.clientY - partnerTouchStart.current.y;

        if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
          setPartnerPage((current) =>
            deltaX > 0
              ? current === 0
                ? totalPartnerPages - 1
                : current - 1
              : current === totalPartnerPages - 1
              ? 0
              : current + 1
          );
        }

        partnerTouchStart.current = null;
      }}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {visiblePartnerPublications.map((publication, index) => (
          <a
            key={`${publication.image}-${index}`}
            href={publication.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_0_28px_rgba(236,72,153,0.45)] active:scale-[0.98]"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#17112d]">
              <Image
                src={publication.image}
                alt={`Pubblicazione DJH ${
                  partnerPage * publicationsPerPage + index + 1
                }`}
                fill
                draggable={false}
                onContextMenu={(event) => event.preventDefault()}
                className="select-none object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <div className="font-['Comic_Sans_MS'] flex items-center justify-center gap-2 px-2 pb-2 pt-4 text-center text-sm text-zinc-300 transition duration-300 group-hover:text-white">
              Maggiori informazioni
              <span className="transition duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>

    {totalPartnerPages > 1 && (
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() =>
            setPartnerPage((current) =>
              current === 0 ? totalPartnerPages - 1 : current - 1
            )
          }
          className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
        >
          Indietro
        </button>

        <div className="font-['Comic_Sans_MS'] text-sm text-zinc-300">
          {partnerPage + 1} / {totalPartnerPages}
        </div>

        <button
          type="button"
          onClick={() =>
            setPartnerPage((current) =>
              current === totalPartnerPages - 1 ? 0 : current + 1
            )
          }
          className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
        >
          Avanti
        </button>
      </div>
    )}
  </div>
</section>

                 <section id="dj" className="scroll-mt-24 px-6 pt-8 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
              I protagonisti del progetto
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              I DJ IN TOUR
            </h2>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "GIOELE",
                image: "/foto-dj/jojo.webp",
                video: "/video-djh/gioele.mp4",
              },
              {
                name: "ALESSANDRO - GUIDO",
                image: "/foto-dj/geko.webp",
                video: "/video-djh/alessandro-guido.mp4",
              },
              {
                name: "GIORGIO",
                image: "/foto-dj/gioskull.webp",
                video: "/video-djh/giorgio.mp4",
              },
              {
                name: "SOFIA",
                image: "/foto-dj/sofy.webp",
                video: "/video-djh/sofia.mp4",
              },
              {
                name: "STEFANIA",
                image: "/foto-dj/stefy.webp",
                video: "/video-djh/stefania.mp4",
              },
              {
                name: "OMAR",
                image: "/foto-dj/strudar.webp",
                video: "/video-djh/omar.mp4",
              },
            ].map((dj, index) => (
              <button
                key={dj.name}
                type="button"
                onClick={() => setActiveDjIndex(index)}
                className="group relative text-left"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:border-pink-400/50 group-hover:shadow-[0_0_35px_rgba(236,72,153,0.45)] active:scale-[0.98]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(14,165,233,0.50), rgba(132,204,22,0.40))",
                    }}
                  />

                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#17112d] p-3">
                    <Image
                      src={dj.image}
                      alt={dj.name}
                      fill
                      className="object-contain object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-['Comic_Sans_MS'] text-xl font-semibold text-white">
                    {dj.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {activeDjIndex !== null && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-xl">
            <button
              type="button"
              aria-label="Chiudi"
              onClick={() => setActiveDjIndex(null)}
              className="absolute right-4 top-4 z-[95] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] active:scale-[0.96]"
            >
              ×
            </button>

            <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#17112d]/95 p-4 shadow-[0_0_80px_rgba(236,72,153,0.25)] sm:p-6">
              {[
                {
                  name: "GIOELE",
                  video: "/video-djh/gioele.mp4",
                },
                {
                  name: "ALESSANDRO - GUIDO",
                  video: "/video-djh/geko.mp4",
                },
                {
                  name: "GIORGIO",
                  video: "/video-djh/giorgio.mp4",
                },
                {
                  name: "SOFIA",
                  video: "/video-djh/sofia.mp4",
                },
                {
                  name: "STEFANIA",
                  video: "/video-djh/stefania.mp4",
                },
                {
                  name: "OMAR",
                  video: "/video-djh/omar.mp4",
                },
              ].map((dj, index) =>
                index === activeDjIndex ? (
                  <div key={dj.name}>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <div className="relative mx-auto aspect-[9/16] max-h-[58vh] w-full max-w-[340px] overflow-hidden rounded-2xl sm:max-w-3xl sm:aspect-video sm:max-h-[62vh]">
                        <video
                          key={dj.video}
                          src={dj.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="relative mt-5 text-center">
                      <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
                        DJH in Tour
                      </p>

                      <h3 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
                        {dj.name}
                      </h3>
                    </div>
                  </div>
                ) : null
              )}

              <div className="relative mt-6 overflow-x-auto pb-2">
                <div className="mx-auto flex w-max gap-3 px-2">
                  {[
                    "GIOELE",
                    "ALESSANDRO - GUIDO",
                    "GIORGIO",
                    "SOFIA",
                    "STEFANIA",
                    "OMAR",
                  ].map((name, index) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActiveDjIndex(index)}
                      className={[
                        "font-['Comic_Sans_MS'] rounded-full border px-4 py-2 text-sm transition-all duration-300",
                        index === activeDjIndex
                          ? "border-pink-400/70 bg-white text-black shadow-[0_0_22px_rgba(236,72,153,0.55)]"
                          : "border-white/15 bg-white/10 text-white hover:border-pink-400/50 hover:shadow-[0_0_18px_rgba(236,72,153,0.40)]",
                      ].join(" ")}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

           <section id="foto" className="scroll-mt-24 px-6 pt-8 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
              Gallery
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Foto
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {visibleGalleryPhotos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                onClick={() =>
  setActivePhotoIndex(
    galleryPage * photosPerPage + index
  )
}
                onContextMenu={(event) => event.preventDefault()}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_0_28px_rgba(236,72,153,0.45)] active:scale-[0.98]"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#17112d]">
                  <Image
                    src={photo}
                    alt={`Foto DJH ${galleryPage * photosPerPage + index + 1}`}
                    fill
                    onContextMenu={(event) => event.preventDefault()}
                    draggable={false}
                    className="select-none object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
              </button>
            ))}
          </div>

          {totalGalleryPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setGalleryPage((current) =>
                    current === 0 ? totalGalleryPages - 1 : current - 1
                  )
                }
                className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
              >
                Indietro
              </button>

              <div className="font-['Comic_Sans_MS'] text-sm text-zinc-300">
                {galleryPage + 1} / {totalGalleryPages}
              </div>

              <button
                type="button"
                onClick={() =>
                  setGalleryPage((current) =>
                    current === totalGalleryPages - 1 ? 0 : current + 1
                  )
                }
                className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
              >
                Avanti
              </button>
            </div>
          )}
        </div>

                {activePhotoIndex !== null && (
          <div
  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-xl"
  onContextMenu={(event) => event.preventDefault()}
  onTouchStart={(event) => {
    const touch = event.touches[0];
    photoTouchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }}
  onTouchEnd={(event) => {
    if (!photoTouchStart.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - photoTouchStart.current.x;
    const deltaY = touch.clientY - photoTouchStart.current.y;

    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setActivePhotoIndex((current) => {
        if (current === null) return null;

        return deltaX > 0
          ? current === 0
            ? galleryPhotos.length - 1
            : current - 1
          : current === galleryPhotos.length - 1
          ? 0
          : current + 1;
      });
    }

    photoTouchStart.current = null;
  }}
>
            <button
              type="button"
              aria-label="Chiudi foto"
              onClick={() => setActivePhotoIndex(null)}
              className="absolute right-4 top-4 z-[105] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] active:scale-[0.96]"
            >
              ×
            </button>

            {/* FRECCIA SINISTRA */}
            <button
              type="button"
              aria-label="Foto precedente"
              onClick={() =>
                setActivePhotoIndex((current) =>
                  current === 0
                    ? galleryPhotos.length - 1
                    : (current ?? 0) - 1
                )
              }
              className="absolute left-4 top-1/2 z-[105] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-3xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] sm:grid"
            >
              ‹
            </button>

            {/* FRECCIA DESTRA */}
            <button
              type="button"
              aria-label="Foto successiva"
              onClick={() =>
                setActivePhotoIndex((current) =>
                  current === galleryPhotos.length - 1
                    ? 0
                    : (current ?? 0) + 1
                )
              }
              className="absolute right-4 top-1/2 z-[105] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-3xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] sm:grid"
            >
              ›
            </button>

            <div className="relative max-h-[82vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#17112d]/95 p-3 shadow-[0_0_80px_rgba(236,72,153,0.25)]">
              <div className="relative h-[78vh] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src={galleryPhotos[activePhotoIndex]}
                  alt="Foto DJH ingrandita"
                  fill
                  onContextMenu={(event) => event.preventDefault()}
                  draggable={false}
                  className="select-none object-contain object-center"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        )}
        </section>

          <section id="eventi" className="scroll-mt-24 px-6 pt-8 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
              DJH in Tour
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Eventi
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleEvents.map((event, index) => {
              const realIndex = eventsPage * eventsPerPage + index;

              return (
                <button
                  key={`${event.title}-${realIndex}`}
                  type="button"
                  onClick={() => setActiveEventIndex(realIndex)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_0_28px_rgba(236,72,153,0.45)] active:scale-[0.98]"
                >
                  <div className="font-['Comic_Sans_MS'] px-2 pb-3 pt-2 text-sm leading-relaxed text-zinc-300">
                    <div className="text-pink-400">{event.place}</div>
                    <div>{event.date}</div>
                    <div>{event.location}</div>
                  </div>

                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#17112d]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="select-none object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="font-['Comic_Sans_MS'] px-2 pb-2 pt-4 text-center text-sm text-zinc-300 transition duration-300 group-hover:text-white">
                    Maggiori dettagli
                  </div>
                </button>
              );
            })}
          </div>

          {totalEventsPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setEventsPage((current) =>
                    current === 0 ? totalEventsPages - 1 : current - 1
                  )
                }
                className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
              >
                Indietro
              </button>

              <div className="font-['Comic_Sans_MS'] text-sm text-zinc-300">
                {eventsPage + 1} / {totalEventsPages}
              </div>

              <button
                type="button"
                onClick={() =>
                  setEventsPage((current) =>
                    current === totalEventsPages - 1 ? 0 : current + 1
                  )
                }
                className="font-['Comic_Sans_MS'] rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] active:scale-[0.96]"
              >
                Avanti
              </button>
            </div>
          )}
        </div>

        {activeEventIndex !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-xl"
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              type="button"
              aria-label="Chiudi evento"
              onClick={() => setActiveEventIndex(null)}
              className="absolute right-4 top-4 z-[105] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] active:scale-[0.96]"
            >
              ×
            </button>

            <button
              type="button"
              aria-label="Evento precedente"
              onClick={() =>
                setActiveEventIndex((current) =>
                  current === 0 ? djhEvents.length - 1 : (current ?? 0) - 1
                )
              }
              className="absolute left-4 top-1/2 z-[105] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-3xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] sm:grid"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Evento successivo"
              onClick={() =>
                setActiveEventIndex((current) =>
                  current === djhEvents.length - 1 ? 0 : (current ?? 0) + 1
                )
              }
              className="absolute right-4 top-1/2 z-[105] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-3xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] sm:grid"
            >
              ›
            </button>

            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#17112d]/95 p-3 shadow-[0_0_80px_rgba(236,72,153,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-5"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                eventTouchStart.current = {
                  x: touch.clientX,
                  y: touch.clientY,
                };
              }}
              onTouchEnd={(e) => {
                if (!eventTouchStart.current) return;

                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - eventTouchStart.current.x;
                const deltaY = touch.clientY - eventTouchStart.current.y;

                if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
  setActivePhotoIndex((current) => {
    if (current === null) return null;

    return deltaX > 0
      ? current === 0
        ? galleryPhotos.length - 1
        : current - 1
      : current === galleryPhotos.length - 1
      ? 0
      : current + 1;
  });
}

if (deltaY < -90 && Math.abs(deltaY) > Math.abs(deltaX)) {
  setActivePhotoIndex(null);
}

photoTouchStart.current = null;
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-3xl opacity-70 blur-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.45), rgba(14,165,233,0.30), rgba(132,204,22,0.25))",
                }}
              />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                <button
  type="button"
  onClick={() => setEventImageZoomOpen(true)}
  className="relative h-[42vh] sm:h-[50vh] w-full overflow-hidden rounded-2xl cursor-zoom-in"
>
                  <Image
                    src={djhEvents[activeEventIndex].image}
                    alt={djhEvents[activeEventIndex].title}
                    fill
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="select-none object-contain object-center"
                    sizes="100vw"
                  />
                </button>
              </div>

              <div className="relative mt-6 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
                  {djhEvents[activeEventIndex].place}
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
                  {djhEvents[activeEventIndex].title}
                </h3>

                <div className="font-['Comic_Sans_MS'] mt-3 text-sm text-zinc-400">
                  {djhEvents[activeEventIndex].date} •{" "}
                  {djhEvents[activeEventIndex].location}
                </div>

                <p className="font-['Comic_Sans_MS'] mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {djhEvents[activeEventIndex].description}
                </p>
              </div>

              <div className="relative mt-7 flex items-center justify-center gap-2">
                {djhEvents.map((_, index) => (
                  <button
                    key={`event-popup-indicator-${index}`}
                    type="button"
                    aria-label={`Vai all'evento ${index + 1}`}
                    onClick={() => setActiveEventIndex(index)}
                    className={[
                      "h-2.5 rounded-full transition-all duration-300",
                      index === activeEventIndex
                        ? "w-8 bg-pink-400 shadow-[0_0_16px_rgba(236,72,153,0.75)]"
                        : "w-3 bg-white/25 hover:bg-white/45",
                    ].join(" ")}
                  />
                ))}
              </div>

            <p className="font-['Comic_Sans_MS'] relative mt-4 text-center text-xs text-zinc-400 sm:hidden">
  Scorri a destra o sinistra per cambiare evento. Scorri verso l’alto per chiudere.
</p>

{eventImageZoomOpen && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-xl">
    <button
      type="button"
      aria-label="Chiudi immagine"
      onClick={() => setEventImageZoomOpen(false)}
      className="absolute right-4 top-4 z-[125] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition duration-300 hover:border-pink-400/60 hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] active:scale-[0.96]"
    >
      ×
    </button>

    <div className="relative h-[86vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-black p-2">
      <Image
        src={djhEvents[activeEventIndex].image}
        alt={djhEvents[activeEventIndex].title}
        fill
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="select-none object-contain object-center"
        sizes="100vw"
      />
    </div>
  </div>
)}

            </div>
          </div>
        )}
      </section>

      <section id="presidente" className="scroll-mt-24 px-6 pt-8 pb-24">
  <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10 lg:grid-cols-12 lg:items-center">
    <div className="lg:col-span-5">
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(14,165,233,0.55), rgba(132,204,22,0.45))",
          }}
        />

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#17112d]">
          <Image
            src="/foto-djh/antonio-consorti.webp"
            alt="Antonio Consorti"
            fill
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </div>
    </div>

    <div className="text-center lg:col-span-7 lg:text-left">
      <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
        Il presidente
      </p>

      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
        Dott. Antonio Consorti
      </h2>

      <p className="font-['Comic_Sans_MS'] mt-6 text-lg leading-relaxed text-zinc-300">
        Il Dott. Antonio Consorti è logopedista e docente universitario, con una lunga esperienza nel supporto ai pazienti e alle loro famiglie. Il suo approccio si basa sull’ascolto, sulla comunicazione chiara e sul rispetto delle esigenze di ogni persona, valorizzando il coinvolgimento della famiglia nel percorso di cura.
      </p>

      <p className="font-['Comic_Sans_MS'] mt-6 text-sm uppercase tracking-[0.25em] text-pink-400">
        Maggiori informazioni
      </p>

      <div className="mt-5 flex flex-col items-center gap-3 lg:items-start">
        <a
          href="https://www.viredisproject.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-['Comic_Sans_MS'] rounded-full border border-fuchsia-400/30 bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:border-fuchsia-300/70 hover:shadow-[0_0_28px_rgba(236,72,153,0.75),0_0_70px_rgba(236,72,153,0.35)] active:scale-[0.98]"
        >
          Website Vi.Re.Dis
        </a>
      </div>
    </div>
  </div>
</section>
      <section id="formazione" className="scroll-mt-24 px-6 pt-8 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(236,72,153,0.10)] backdrop-blur sm:p-10">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
              Formazione
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              The Sound Wave Academy
            </h2>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="group relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(14,165,233,0.55), rgba(132,204,22,0.45))",
                    }}
                  />

                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#17112d] p-8">
                    <Image
                      src="/brand/tsw-logo.svg"
                      alt="The Sound Wave"
                      fill
                      className="object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 24vw"
                    />
                  </div>
                </div>

                <div className="group relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2 shadow-[0_0_60px_rgba(236,72,153,0.16)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(236,72,153,0.85), rgba(14,165,233,0.65), rgba(132,204,22,0.55))",
                    }}
                  />

                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#17112d]">
                    {formazioneImages.map((src, index) => (
                      <Image
                        key={src}
                        src={src}
                        alt={`Formazione The Sound Wave ${index + 1}`}
                        fill
                        priority={index === 0}
                        className={[
                          "object-cover object-center",
                          "transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          index === activeFormazioneImage
                            ? "opacity-100"
                            : "opacity-0",
                        ].join(" ")}
                        sizes="(max-width: 1024px) 100vw, 38vw"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:col-span-7 lg:text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-pink-400">
                DJ & Music Training
              </p>

              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Formazione musicale firmata The Sound Wave
              </h3>

              <p className="font-['Comic_Sans_MS'] mt-6 text-lg leading-relaxed text-zinc-300">
                The Sound Wave porta avanti i corsi DJH con passione, energia e grande coinvolgimento emotivo, accompagnando ogni ragazzo in un percorso fatto di musica, crescita ed emozioni.

Attraverso l’insegnamento delle basi tecniche del DJing, del senso del ritmo e dell’ascolto musicale, il nostro obiettivo è far vivere la musica non solo con la mente, ma anche con il corpo e con il cuore.

Ogni lezione nasce dal desiderio di trasmettere amore per la musica, valorizzando le capacità di ogni ragazzo e aiutandolo a esprimersi liberamente attraverso il ritmo e le emozioni.
              </p>

              <div className="mt-8 flex justify-center lg:justify-start">
                <a
                  href="https://www.thesoundwaveofficial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Comic_Sans_MS'] rounded-full border border-fuchsia-400/30 bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:border-fuchsia-300/70 hover:shadow-[0_0_28px_rgba(236,72,153,0.75),0_0_70px_rgba(236,72,153,0.35)] active:scale-[0.98]"
                >
                  <span className="flex flex-col items-center leading-tight">
  <span>The Sound Wave </span>
  <span>Official Website</span>
</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}