"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects, socials } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

// Floating cards (sm+) scale with the viewport. Height keeps the same
// landscape ratio (~1.48:1) the cards were designed with.
const CARD_WIDTH = "clamp(200px, 28vw, 370px)";
const CARD_HEIGHT = `calc(${CARD_WIDTH} * 0.675)`;

const LAYOUT = [
  { top: "10%", left: "4%", rotate: -6, float: 0 },
  { top: "10%", left: "60%", rotate: 5, float: 1.4 },
  { top: "64%", left: "6%", rotate: -3, float: 0.7 },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      ref={ref}
      className="relative h-dvh w-full overflow-hidden bg-[#0a0a0a]"
    >
      {LAYOUT.map((pos, i) => {
        const project = projects[i];
        return (
          <motion.div
            key={project.slug}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              opacity,
              y: drift,
            }}
            className="hidden sm:block"
          >
            <div
              className="w-full h-full animate-float"
              style={
                {
                  animationDelay: `${pos.float}s`,
                  "--rot": `${pos.rotate}deg`,
                } as CSSProperties
              }
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                <ProjectVisual project={project} sizes="28vw" compact />
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.h1
          style={{ opacity, color: "rgb(222, 100, 100)" }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-tight"
        >
          Daniel Masona
        </motion.h1>
        <motion.p
          style={{ opacity }}
          className="mt-4 text-sm sm:text-base text-white/60 max-w-lg tracking-wide"
        >
          TypeScript · React · Next.js · Vue · Python · Tailwind CSS
        </motion.p>
        <motion.div style={{ opacity }} className="mt-8 flex gap-5 text-sm text-white/50">
          <a href={socials.github} className="hover:text-white transition-colors">
            GitHub
          </a>
          <a href={socials.linkedin} className="hover:text-white transition-colors">
            LinkedIn
          </a>
          <a href={`mailto:${socials.email}`} className="hover:text-white transition-colors">
            Email
          </a>
        </motion.div>
      </div>

      {/* Phones don't have room for the floating cards beside the title, so
          they get the same projects as a swipeable row near the bottom. */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-x-0 bottom-16 sm:hidden"
      >
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="relative shrink-0 snap-center w-[62vw] max-w-[280px] aspect-[3/2] rounded-lg overflow-hidden ring-1 ring-white/10"
            >
              <ProjectVisual project={project} sizes="62vw" compact />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase"
      >
        Scroll
      </motion.div>
    </section>
  );
}
