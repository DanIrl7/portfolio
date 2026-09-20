# Hi, I'm Daniel

I'm a self-taught developer who likes building things I'd actually want to use — an
e-commerce site themed around dogs, a terminal tool that saves me from retyping the
same commands, a virtual piano because I love music. This site is where I put that
work together.

**[View the live site →](https://portfolio-seven-chi-016l223evm.vercel.app/)**

## What I work with

TypeScript, React, and Next.js are where I spend most of my time, with Vue and
Python in the mix depending on the project. Tailwind CSS for styling, and lately
I've been getting into Framer Motion and GSAP for the kind of scroll-driven,
animated interfaces this portfolio itself uses.

## What I've built

**[nyxx](https://github.com/Danirl7/nyxx)** — A terminal UI written in Python. I
got tired of retyping the same commands and listing a directory's contents every
time just to see where I was, so I built this as my way of actually learning
Python on a real project — visual navigation, saved jumps, reusable command
memos.

**[DoggDenn](https://github.com/Danirl7/DoggDenn)** ([live demo](https://doggdenn.vercel.app/))
— A full e-commerce site built with Next.js, Clerk, Stripe, and a Postgres/Prisma
backend. I put this together after a few months away from coding to get
comfortable with React and the fundamentals again — fetching data, handling
error states, authorization. I love animals, so I themed it around dogs. It
isn't live with real users or data, but it's my first real, full-scale app.

**[pianoVue](https://github.com/Danirl7/pianoVue)** ([live demo](https://pianovue.vercel.app/))
— An online piano built to get familiar with Vue: 61 keys, a chord library, and
real-time synthesis via Tone.js. I love music, so this felt like a natural way
to learn the framework, and it only took a few days to put together.

## Get in touch

[GitHub](https://github.com/Danirl7) · [LinkedIn](https://linkedin.com/in/daniel-masona-b0036a1ba) · [Email](mailto:danielmasona7@gmail.com)

---

If you're curious how the site itself works: it's Next.js + Tailwind, with
Framer Motion driving the scroll-linked scale/rotate on each project and GSAP's
ScrollSmoother/ScrollTrigger handling the smooth scroll and pinning. Each
project's image pins full-screen while scrolling, eases in with a spring rather
than tracking the scrollbar 1:1, then settles into its description. Project
data lives in `lib/projects.ts` if you want to poke around.

```bash
npm install
npm run dev
```
