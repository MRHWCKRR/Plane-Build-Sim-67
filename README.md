# Plane-Build-Sim-67
*Build a plane with the correct parts and names for the virtual plane to take off!*
*Interactive game made to revise for exam!!!*

## Landing page

A sky-themed introduction with locally hosted AI-generated airplane imagery and scroll-driven airplane motion. The introduction links directly to the playable Aircraft Lab at `/game.html`.

## Aircraft Lab

Choose a Boeing 737, Boeing 787, Airbus A220, Boeing 747-400, F/A-18 Hornet, or F-16 Fighting Falcon. Each aircraft has distinct AI-generated scenes and its own saved progress. Airliners have exterior, cockpit, cabin and tail views; fighters have exterior, cockpit and tail views. Airliners each offer 40 name/function matches; each fighter offers 32.

Part cards are text-only. Selecting or dragging a name opens a brief history and fun-fact panel, with a source link. Definition cards reveal their notes only after a correct match. The desktop notes column stays reserved so targets do not shift during a drag; smaller screens use a compact dismissible overlay. The “Explore, match, discover” strip has been removed.

Aircraft-specific details include raked wingtips on the 787, a sidestick in the A220, and a canopy, control stick, ejection seat and stabilator on the Hornet. Fighters have no passenger cabin and omit airliner-only tasks. The 747 has four thrust levers; the F-16 has a right-hand sidestick, flaperons, leading-edge flaps and a single engine. Fighter engine targets are in the rear view where the exhausts are visible.

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
- `npm test` — run nine state checks and 23 browser checks against the production output; build first.
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
- `game/fleet.mjs`: aircraft-specific parts, view availability and calibrated marker positions.
- `game/facts.mjs`: brief part histories, fun facts and reference links.
- `game/game.mjs`: game interactions, drag gestures, navigation, camera and dialogs.
- `game/game.css`: responsive game layout and controls.
- `assets/game/README.md`: built-in ImageGen prompts for the four new raster environments.
- `assets/game/FLEET-ARTWORK.md`: built-in ImageGen prompts for 11 additional aircraft scenes.

The production page has no runtime dependencies, server, account system, or remote progress storage.


### Takeoff celebration

Completing every part name and definition for an aircraft starts a short departure sequence: preparation, runway acceleration, liftoff and an airborne finish. Each of the six aircraft uses its own AI-generated transparent raster sprite. Skip or replay the sequence, or return to exploring with saved progress intact. Reduced-motion settings show a static airborne scene. Animations pause when the tab is hidden and are cancelled when the completion dialog closes. Sprites load only when the flight report opens.
