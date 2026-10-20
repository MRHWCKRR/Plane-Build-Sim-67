# Plane-Build-Sim-67
*Build a plane with the correct parts and names for the virtual plane to take off!*
*Interactive game made to revise for exam!!!*

## Landing page

A sky-themed introduction with locally hosted AI-generated airplane imagery and scroll-driven airplane motion. The game itself is coming soon.

The production site is static HTML, CSS, and JavaScript with no runtime dependencies, external fonts, animation libraries, or SVG artwork. Images use responsive WebP sources. The page respects reduced-motion and data-saving preferences, includes a persistent motion toggle, and remains readable and navigable without JavaScript.

### Development

- `npm install` — install browser test tools.
- `npm run dev` — serve at `http://127.0.0.1:4173`.
- `npm run build` — copy public files into `dist` (no dependencies required).
- `npm run preview` — serve the production output.
- `npx playwright install chromium` — install the browser for checks.
- `npm test` — run browser checks against the production output; build first.

To use an existing browser, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable path before running tests.

### Deployment

Vercel reads `vercel.json`, runs `npm run build`, and serves `dist`. Pushes to the Vercel-connected production branch publish the site through the existing integration. Do not deploy development folders as the static output.

### Files

- `index.html`: content and native navigation.
- `styles.css`: responsive layouts and reduced-motion styles.
- `app.js`: scroll motion and preference controls; one requested animation frame per scroll update, no continuous idle loop.
- `assets/`: compressed raster artwork and image-generation prompts.
- `tests/landing.spec.mjs`: browser behavior and accessibility checks.

The generated imagery is illustrative and should not be used as an aircraft-parts accuracy reference when implementing the educational game.

