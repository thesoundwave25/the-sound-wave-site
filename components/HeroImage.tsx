"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export default function HeroImage({ src, alt }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      sizes="(max-width: 1280px) 100vw, 1280px"
      onLoad={() => setLoaded(true)}
      className={[
  "object-cover scale-[1.02] md:scale-105",
  "transition-opacity duration-900 ease-out delay-200",

  loaded ? "opacity-100" : "opacity-0",
].join(" ")}

    />
  );
}
