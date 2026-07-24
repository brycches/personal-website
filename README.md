# Personal resume site — Bryce Chesley

Personal resume website for Bryce Chesley, Software Development Engineer.

- **Stack:** [Nuxt 4](https://nuxt.com/) (Vue 3), no backend
- **Animation:** [GSAP 3](https://gsap.com/) — hero load sequence, MotionPath data packets on the SunApps integration diagram, ScrollTrigger reveals, stat counters
- **Live data:** the Projects section pulls public repos from the GitHub API at page load
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

Push to `main` — the workflow runs `nuxt generate` and publishes `.output/public` to GitHub Pages.
