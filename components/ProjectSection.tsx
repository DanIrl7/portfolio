"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

gsap.registerPlugin(ScrollTrigger);

// Matches each project's floating card position/rotation in the Hero,
// so a project's zoom-in reads as continuing from that same spot on screen.
const ORIGINS = [
  { origin: "6% 12%", rotate: -6 },
  { origin: "94% 12%", rotate: 5 },
  { origin: "8% 88%", rotate: -3 },
];

export default function ProjectSection({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const { origin, rotate: startRotate } = ORIGINS[index % ORIGINS.length];

  // Zoom completes at 45% of the container's scroll range; the remaining
  // range is scroll room for the pin to hold, then release naturally.
  const springConfig = { stiffness: 260, damping: 38, mass: 0.5 };
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.45], [0.4, 1]),
    springConfig
  );
  const rotate = useSpring(
    useTransform(scrollYProgress, [0, 0.45], [startRotate, 0]),
    springConfig
  );
  const radius = useSpring(
    useTransform(scrollYProgress, [0, 0.45], [16, 0]),
    springConfig
  );
  const indexLabel = String(index + 1).padStart(2, "0");

  // CSS `position: sticky` drifts out of sync under ScrollSmoother's
  // transformed content wrapper, so the pin is handled by ScrollTrigger
  // instead, which is smoother-aware.
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: ref.current!,
      start: "top top",
      end: "bottom top",
      pin: pinRef.current!,
      pinSpacing: false,
    });
    return () => trigger.kill();
  }, []);

  return (
    <>
      <section ref={ref} className="relative" style={{ height: "220vh" }}>
        <div
          ref={pinRef}
          className="h-screen w-full overflow-hidden bg-[#0a0a0a]"
        >
          <motion.div
            style={{
              scale,
              rotate,
              borderRadius: radius,
              transformOrigin: origin,
            }}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            <ProjectVisual project={project} priority={index === 0} />
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] px-6 sm:px-16 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: project.accent }}
          >
            {indexLabel} — {project.tagline}
          </span>
          <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-white">
            {project.name}
          </h2>
          <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/60"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-white/85 transition-colors"
              >
                Live demo
              </a>
            )}
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full border border-white/25 text-white hover:border-white/60 transition-colors"
            >
              View code
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
