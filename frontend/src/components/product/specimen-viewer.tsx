"use client";

import Image from "next/image";
import { useState } from "react";

interface SpecimenViewerProps {
  images: string[];
  name: string;
}

export function SpecimenViewer({ images, name }: SpecimenViewerProps) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[5/4] w-full items-center justify-center rounded-4xl bg-surface-accent sm:aspect-[4/3]">
        <p className="px-6 text-center font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
          No photograph supplied for this item
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-4xl bg-surface-accent sm:aspect-[4/3]">
        <Image
          key={images[active]}
          src={images[active]}
          alt={`${name} — catalog image ${active + 1} of ${images.length}`}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div role="group" aria-label="Catalog images" className="mt-3 flex gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-label={`View catalog image ${index + 1}`}
              className={`relative size-14 shrink-0 overflow-hidden rounded-2xl bg-surface-accent transition-opacity ${
                active === index ? "opacity-100" : "opacity-55 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
          <p className="self-center pl-2 font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
            {active + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
