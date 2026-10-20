# Aircraft Lab

User request: remove the landing page’s unfinished-game promotional section and implement an interactive identification game with a collapsible sidebar, main scene, upper-right view switcher, and a lower tray of draggable part names and definitions.

Implementation: a separate static `/game.html` linked from the landing page. Four locally hosted AI-generated raster scenes show exterior, cockpit, cabin and tail. The scene and annotation points share a 3:2 coordinate system and transform together, with numbered callouts connected to the pictured regions. Photo-based camera tilt and pan provide immersion without a WebGL dependency.

The required names are included with spelling corrected; additional cockpit controls are the control yoke, thrust levers and primary flight display. There are 20 parts and 40 independently scored matches. Separate name/function rounds avoid revealing the answer immediately. Free hints and a field guide support all ages; no timer or penalties. Full completion opens a flight report.

Input methods: pointer-based dragging for mouse and touch, click/tap selection followed by a target, and native keyboard controls. View and round switches retain all progress. Local storage is validated and optional. Reset requires an in-game confirmation. Zoom is bounded to 1–3; reduced motion disables camera tilt while retaining user-operated zoom and pan.

Verification: five game-state tests and 17 browser tests passed against the built output, including a full 40-match completion, mouse drag repeated five times, actual touch input, keyboard matching, zoom bounds, blocked storage, mobile targets, view imagery, and the retained landing page. Desktop and mobile screenshots were inspected. The first game build caught and fixed a marker occluded by the camera bar; pointer gestures replaced unreliable native HTML dragging.
