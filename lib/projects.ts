export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  image?: string;
  liveUrl?: string;
  repoUrl: string;
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "nyxx",
    name: "nyxx",
    tagline: "Terminal navigation, made easy",
    description:
      "Nyxx is a TUI I built in Python because I was tired of retyping the same commands and having to list out a directory's contents every time just to see where I was going. It became my way of learning Python through an actual project — visual navigation, saved jumps, reusable command memos. Check out the GitHub repo and give it a try!",
    stack: ["Python", "curses", "pytest"],
    image: "/images/nyxx.png",
    repoUrl: "https://github.com/Danirl7/nyxx",
    accent: "#ec4899",
  },
  {
    slug: "doggdenn",
    name: "DoggDenn",
    tagline: "E-commerce, built for dog people",
    description:
      "I built DoggDenn after a few months away from coding, mainly to get comfortable with React and core frontend fundamentals — fetching data, handling error states, and authorization. I love animals, so I themed it around dogs and turned it into a full e-commerce site with Next.js, Clerk, Stripe, and a Postgres/Prisma backend. It isn't live and has no real users or data, but it's my first real, full-scale application.",
    stack: ["Next.js", "TypeScript", "Prisma", "Stripe", "Clerk", "Tailwind"],
    image: "/images/doggdenn.webp",
    liveUrl: "https://doggdenn.vercel.app/",
    repoUrl: "https://github.com/Danirl7/DoggDenn",
    accent: "#c2410c",
  },
  {
    slug: "pianovue",
    name: "pianoVue",
    tagline: "A brutalist virtual piano",
    description:
      "I made pianoVue to get familiar with the Vue framework. I love music, so I went with an online piano — 61 keys, a chord library, and real-time synthesis via Tone.js. It's a simple little site I put together in a few days. Feel free to try it out!",
    stack: ["Vue 3", "Tone.js", "Vite"],
    image: "/images/pianovue.png",
    liveUrl: "https://pianovue.vercel.app/",
    repoUrl: "https://github.com/Danirl7/pianoVue",
    accent: "rgb(222, 100, 100)",
  },
];

export const socials = {
  email: "danielmasona7@gmail.com",
  github: "https://github.com/Danirl7",
  linkedin: "https://linkedin.com/in/daniel-masona-b0036a1ba",
};
