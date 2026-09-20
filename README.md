# Daniel Masona — Portfolio

A single-page portfolio site with a scroll-driven hero and per-project zoom
transitions, inspired by [Playfight](https://www.letsplayfight.com/).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion for scroll-linked scale/rotate transforms
- GSAP ScrollSmoother + ScrollTrigger for smooth scrolling and pinning
- Instrument Sans (body) + Fraunces (display serif)

## How it works

Each project section pins its image full-screen while scrolling, easing in
via a spring rather than tracking scroll 1:1, then releases into a plain
description block once the zoom completes. The first-load position and
rotation of each pinned image matches its floating card in the hero, so the
zoom reads as continuing from that same spot on screen.

## Development

```bash
npm install
npm run dev
```

Project data (descriptions, links, accent colors) lives in `lib/projects.ts`.
