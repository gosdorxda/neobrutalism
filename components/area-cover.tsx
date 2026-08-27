"use client";

import { useEffect, useState } from "react";

export function AreaCover() {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    fetch("/indonesia-map.svg")
      .then((res) => res.text())
      .then(setSvg)
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-background py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Areas We Cover
          </h2>
          <p className="text-sm font-base text-foreground/60 max-w-lg mx-auto">
            We are starting in Central Java, Indonesia. We plan to expand to more regions as we grow.
          </p>
        </div>

        {/* Map */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div
            className="relative w-full indonesia-map [&_svg]:w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </section>
  );
}
