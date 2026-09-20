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

  return (
    <Image
      src={project.image}
      alt={project.name}
      fill
      sizes={sizes}
      className="object-cover"
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
