import { socials } from "@/lib/projects";

export default function Contact() {
  return (
    <section className="relative min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-xs tracking-widest uppercase text-white/40">
        Get in touch
      </span>
      <h2 className="mt-4 font-serif text-4xl sm:text-6xl md:text-7xl text-white max-w-3xl">
        Let&apos;s build something meaningful.
      </h2>
      <a
        href={`mailto:${socials.email}`}
        className="mt-8 text-lg sm:text-xl text-white/80 hover:text-white transition-colors underline underline-offset-4"
      >
        {socials.email}
      </a>

      <div className="mt-12 flex gap-8 text-sm text-white/50">
        <a
          href={socials.github}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
        <a
          href={socials.linkedin}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors"
        >
          LinkedIn
        </a>
      </div>

      <p className="absolute bottom-6 text-xs text-white/30">
        © {new Date().getFullYear()} Daniel Masona
      </p>
    </section>
  );
}
