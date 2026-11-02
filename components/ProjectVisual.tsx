"use client";

import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/lib/projects";

export default function ProjectVisual({
  project,
  priority = false,
  sizes = "100vw",
  compact = false,
}: {
  project: Project;
  priority?: boolean;
  sizes?: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  // The whole image is always shown: a frame with a different shape gets bars
  // at the sides or top and bottom, rather than the picture being cropped.
  if (!project.image || failed) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${project.accent} 0%, #0a0a0a 85%)`,
        }}
      >
        {compact && (
          <span className="font-serif text-white/90" style={{ fontSize: "1.1rem" }}>
            {project.name}
          </span>
        )}
      </div>
    );
  }

  // The original file is served as it is. Next's image optimizer returned broken WebP
  // for these small images when scaled up to full width, which left the frame blank.
  return (
    <Image
      src={project.image}
      alt={project.name}
      fill
      unoptimized
      sizes={sizes}
      className="object-contain"
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
