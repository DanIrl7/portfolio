"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { projects } from "@/lib/projects";
import { useSmoothScrollY } from "@/lib/useSmoothScrollY";
import ProjectVisual from "./ProjectVisual";

// Phones only: the nyxx card at the bottom of the hero deck grows into the
// nyxx project section as you scroll. Positions are in page coordinates, so
// the card moves with the smooth-scrolled content and stays in step with it.
type Box = {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

function MorphCard({ start }: { start: Box }) {
  const scrollY = useSmoothScrollY();

  // Grows from the deck slot to full screen over the first viewport of scroll.
  const progress = (y: number) => clamp01(y / window.innerHeight);

  const top = useTransform(scrollY, (y) => lerp(start.top, y, progress(y)));
  const left = useTransform(scrollY, (y) => lerp(start.left, 0, progress(y)));
  const width = useTransform(scrollY, (y) =>
    lerp(start.width, window.innerWidth, progress(y))
  );
  const height = useTransform(scrollY, (y) =>
    lerp(start.height, window.innerHeight, progress(y))
  );
  const rotate = useTransform(scrollY, (y) => lerp(start.rotate, 0, progress(y)));
  const radius = useTransform(scrollY, (y) => `${lerp(8, 0, progress(y))}px`);

  // Stay full screen while the nyxx section pins, then fade out. By then the
  // pinned image has reached full size, so the handoff is invisible.
  const opacity = useTransform(scrollY, (y) => {
    const fadeStart = window.innerHeight * 2.2;
    const fadeEnd = window.innerHeight * 2.5;
    return clamp01((fadeEnd - y) / (fadeEnd - fadeStart));
  });

  return (
    <motion.div
      style={{ top, left, width, height, rotate, borderRadius: radius, opacity }}
      className="absolute overflow-hidden bg-[#0a0a0a] shadow-2xl"
    >
      <ProjectVisual
        project={projects[0]}
        sizes="100vw"
        priority
      />
    </motion.div>
  );
}

export default function NyxxMorph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<Box | null>(null);

  // Measure the deck slot relative to this container, which shares its
  // transform with the slot, so the result holds whatever the scroll position.
  useLayoutEffect(() => {
    const measure = () => {
      const slot = document.getElementById("hero-deck-nyxx");
      const container = containerRef.current;
      if (!slot || !container) return;

      const slotRect = slot.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const { a, b } = new DOMMatrix(getComputedStyle(slot).transform);
      const width = slot.offsetWidth;
      const height = slot.offsetHeight;
      const centerX = slotRect.left + slotRect.width / 2 - containerRect.left;
      const centerY = slotRect.top + slotRect.height / 2 - containerRect.top;

      setStart({
        top: centerY - height / 2,
        left: centerX - width / 2,
        width,
        height,
        rotate: (Math.atan2(b, a) * 180) / Math.PI,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0 sm:hidden"
    >
      {start && (
        <MorphCard
          key={`${start.top}-${start.left}-${start.width}-${start.height}-${start.rotate}`}
          start={start}
        />
      )}
    </div>
  );
}
