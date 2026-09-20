"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects, socials } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

const LAYOUT = [
  { top: "10%", left: "4%", width: 340, height: 230, rotate: -6, float: 0 },
  { top: "10%", left: "60%", width: 360, height: 245, rotate: 5, float: 1.4 },
  { top: "64%", left: "6%", width: 370, height: 250, rotate: -3, float: 0.7 },
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
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
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
              width: pos.width,
              height: pos.height,
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
                <ProjectVisual
                  project={project}
                  sizes={`${pos.width}px`}
                  compact
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.h1
          style={{ opacity }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl text-white tracking-tight"
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

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase"
      >
        Scroll
      </motion.div>
    </section>
  );
}
