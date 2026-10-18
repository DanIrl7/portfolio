"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects, socials } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

// Floating cards (sm+) scale with the viewport. Height keeps the same
// landscape ratio (~1.48:1) the cards were designed with.
const CARD_WIDTH = "clamp(200px, 28vw, 370px)";
const CARD_HEIGHT = `calc(${CARD_WIDTH} * 0.675)`;

// Phone "deck": each card's vertical offset and tilt, in the same order as
// projects. nyxx sits at the bottom of the fan; its slot is hidden here
// because NyxxMorph draws that card and grows it into the nyxx section.
const DECK = [
  { y: 50, rotate: 6, z: 3 },
  { y: -50, rotate: -6, z: 1 },
  { y: 0, rotate: 0, z: 2 },
];

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

        {/* Phones don't have room for the floating cards beside the title, so
            the three projects fan out under the text like a deck of cards. */}
        <motion.div
          style={{ opacity }}
          className="relative mt-8 h-[200px] w-[200px] sm:hidden"
        >
          {projects.map((project, i) => (
            <div
              key={project.slug}
              id={i === 0 ? "hero-deck-nyxx" : undefined}
              className={`absolute left-1/2 top-1/2 w-[180px] aspect-[1.88] rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10 ${i === 0 ? "invisible" : ""}`}
              style={{
                transform: `translate(-50%, -50%) translate(0px, ${DECK[i].y}px) rotate(${DECK[i].rotate}deg)`,
                zIndex: DECK[i].z,
              }}
            >
              <ProjectVisual
                project={project}
                sizes="180px"
                compact
                letterboxOnMobile
              />
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase"
      >
        Scroll
      </motion.div>
    </section>
  );
}
