import Hero from "@/components/Hero";
import NyxxMorph from "@/components/NyxxMorph";
import ProjectSection from "@/components/ProjectSection";
import Contact from "@/components/Contact";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main className="relative">
      <NyxxMorph />
      <Hero />
      {projects.map((project, i) => (
        <ProjectSection key={project.slug} project={project} index={i} />
      ))}
      <Contact />
    </main>
  );
}
