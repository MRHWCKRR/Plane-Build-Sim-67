# Plane-Build-Sim-67
*Build a plane with the correct parts and names for the virtual plane to take off!*
*Interactive game made to revise for exam!!!*

## Landing page

A sky-themed introduction with locally hosted AI-generated airplane imagery and scroll-driven airplane motion. The introduction links directly to the playable Aircraft Lab at `/game.html`.

## Aircraft Lab

Explore four AI-generated photographic scenes: the exterior of a twin-engine passenger jet, the cockpit, the passenger cabin, and a close-up of the tail. Match 20 part names and their 20 short definitions to numbered markers. The old “Good things are taking shape” section has been removed.

- Collapsible desktop sidebar and compact mobile navigation.
- Switch views freely without losing progress.
- Drag with a mouse or touch, or select a card and then a target. Keyboard users can use Tab and Enter.
- Zoom from 100% to 300% using the wheel or camera buttons. Pointer position pans the zoomed scene; touch users can drag the scene, and keyboard users can use arrow keys from a focused marker.
- Subtle photo-based camera motion, respecting reduced-motion and data-saving preferences. This uses transformed raster scenes, not a 3D model or WebGL renderer.
- Separate name and definition rounds, free hints, a reference guide, encouraging feedback, a completion report, and a confirmed reset.
- Progress is saved locally on the current device. The game remains playable if storage is blocked.

The part list includes aileron, slats, flaps, spoiler, winglets, cockpit, fuselage, windows, landing gear, turbofan engines, pilot, control yoke, thrust levers, primary flight display, seats, cabin lights, vertical stabilizer, horizontal stabilizer, rudder, and elevator.

Educational definitions are written as short introductions, using the [FAA aviation handbooks](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation) as reference. Images and marker positions are illustrative; they are not maintenance diagrams.

The production site is static HTML, CSS, and JavaScript with no runtime dependencies, external fonts, animation libraries, or SVG artwork. Images use responsive WebP sources. The page respects reduced-motion and data-saving preferences, includes a persistent motion toggle, and remains readable and navigable without JavaScript.

### Development

- `npm install` — install browser test tools.
- `npm run dev` — serve at `http://127.0.0.1:4173`.
- `npm run build` — copy public files into `dist` (no dependencies required).
- `npm run preview` — serve the production output.
- `npx playwright install chromium` — install the browser for checks.
- `npm test` — run five game-state checks and 17 browser checks against the production output; build first.
- `npm run test:unit` — run the game-state checks without a browser.

To use an existing browser, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable path before running tests.

### Deployment

Vercel reads `vercel.json`, runs `npm run build`, and serves `dist`. Pushes to the Vercel-connected production branch publish the site through the existing integration. Do not deploy development folders as the static output.

### Files

- `index.html`: content and native navigation.
- `styles.css`: responsive layouts and reduced-motion styles.
- `app.js`: scroll motion and preference controls; one requested animation frame per scroll update, no continuous idle loop.
- `assets/`: compressed raster artwork and image-generation prompts.
- `tests/landing.spec.mjs`: browser behavior and accessibility checks.
- `game.html`: playable aircraft lab.
- `game/data.mjs`: view metadata, part definitions, physical points and marker offsets.
- `game/state.mjs`: validated progress and matching rules.
- `game/game.mjs`: game interactions, drag gestures, navigation, camera and dialogs.
- `game/game.css`: responsive game layout and controls.
- `assets/game/README.md`: built-in ImageGen prompts for the four new raster environments.

The production page has no runtime dependencies, server, account system, or remote progress storage.

