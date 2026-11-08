# Portfolio — 3D experience context

## Current direction

Build a cinematic, Spider-Verse-inspired portfolio using connected, real-time 3D environments. The user's latest instruction supersedes all earlier layered-2D plans. Scenes have actual geometry, perspective, light sources, shadows and camera travel. No imported character models or flat background scene images are used.

The active branch is `feat/spiderman-update`. The earlier Minecraft portfolio and its assets remain recoverable through Git history. The current application is Vite, native JavaScript and Three.js/WebGL 2.

## Visual reference and implementation

Reference files live in `context/assets/building` and `context/assets/room`. The supplied night exterior and night/top-down bedroom references were inspected to establish blue brick, iron fire escapes, warm windows, a narrow cluttered room, bunk bed, desks, bookshelves and pinned notes. They are reference material, not shipped background textures.

The exterior and animated paper are constructed in `src/world.js`: instanced brickwork, a grated fire escape, a real window opening and sliding sash. `src/room.js` now loads the editable Blender room from `/models/room-draft.glb` into the same scene; the old procedural bedroom has been removed. The camera travels from the exterior (+Z), through the window (Z=0), into the bedroom (-Z). Paper is a tessellated surface that bends and flies away. Canvas-generated text and material textures are applied to 3D surfaces.

Lighting uses cool directional moonlight, a magenta exterior accent, warm interior lights, shadow-casting moonlight, area fills and cyan monitor light. A postprocessing pass adds restrained halftone shadow dots, chromatic edging and vignette. Geometry and lighting are an original interpretation of the references, not a reproduction of the film's production assets.

## Opening and navigation

Exterior → arriving name tag → peel paper → raise window → camera passes inside → framed room exploration.
Paper requires three inputs; window requires five. After 800ms without input, one progress unit decays; further units decay every 500ms. New input resets that delay. Touch/click and keyboard buttons share this behavior; held-key repeats are suppressed.

The camera move takes 2.8 seconds for a readable 3D transition. Reduced motion uses single activations, suppresses sway and paper arrival, and completes travel in 100ms. Enter room bypasses the introduction, successful visits are remembered using `yp-3d-entered`, and Replay intro returns outside. Unavailable storage does not block use.

Room objects, their triangle prompts and the on-demand navigation menu move the camera to the Blender-authored views for About, Projects, Experience and Records. A document icon opens accessible details after zooming; an arrow or Escape returns to the overview. Drag/swipe pans the overview within a constrained range. Actual mesh picking respects the nearest visible surface and resolves interaction metadata through parent groups. Content is explicitly provisional; no project or career history has been invented. Help explains the interaction. Final content, music, and the web-shooting minigame remain future work.

## Responsive and accessible behavior

Essential controls follow their scene objects or remain in the on-demand menu; desktop reveals additional scenery. Portrait layouts pull the exterior camera back and widen the interior view. Offscreen hotspots remain reachable through the room navigation inside the menu. Semantic controls, focus indicators, native dialogs, Escape dismissal and focus return support keyboard use. Physical vibration, sound and hover are optional future enhancements.

WebGL initialization failure presents an explanation, retry action and accessible introduction. Rendering pauses while the document is hidden. Device pixel ratio is capped at 1.5, repeated brick geometry is instanced, and directional shadows are cached between window movements. No video, remote fonts, external scene images or character downloads are required.

## Latest interaction and exterior revisions

The default view has no brand, chapter labels, captions, textual action buttons or persistent room navigation. A small menu icon exposes help, skip, replay and accessible room links when requested. In-world lettering and text in opened detail panels remain.

Reference files `context/assets/nametag/empty-nametag.png`, `context/assets/buttons/single-action-button.png`, and `context/assets/buttons/repetitive-action-button.png` were found and inspected. The source images are screenshots with surrounding backgrounds, so the tag and prompts are recreated as code-native artwork rather than putting rectangular screenshots over the scene. The tag has a white rounded border, red HELLO / MY NAME IS header, dark Yash lettering and a curled top-right corner. Momentum curls both sides; completion folds the edges inward before a tumbling flight, with a separate pale reverse surface.

Repeated actions use the reference's square-inside-circle styling, a momentum ring that drains with inactivity, and a green completed state. Single actions use the triangle prompt with a broken circular outline. Reduced motion also uses the single-action symbol. These are visual game-style cues, not claims of gamepad support. The tag itself is raycast for taps; the window uses a stationary broad target that stays usable as its sash lifts. Empty background taps do nothing. Prompts remain focusable keyboard alternatives.

The escape now has landings below, at, and above the current window, plus the next upper landing. Stairs repeat on the left and descend leftward through real deck openings. Static ironwork is merged into one mesh so added storeys do not introduce hundreds of separate drawing submissions. Interior wall end faces were separated from the facade backing to remove coincident surfaces in the window-height strips beside the escape.

## Name-tag entrance and room reference review — November 7

The name tag now arrives on a 2.1-second camera-local wind path: diagonal entry with tumbling, a cross-gust, a rush toward the lens, depth overshoot and a soft settle. Entry side and gust amplitude vary within bounded ranges on each replay; the final readable pose stays consistent. Wind also bends and ripples the paper during arrival. Action prompts appear once the tag has settled. Reduced motion immediately displays the stable readable pose. Resting size uses up to 90% of viewport width or 72% of viewport height, including the tilt, with the action prompt below.

Room status: the Blender GLB is integrated into the main portfolio . Both now look into the room from its rear window, which aligns with the existing fire escape. The paper animation and moving exterior sash remain controlled by JavaScript. The source remains editable in Blender; further visual refinement is deferred to the user’s art pass.

Use `room-day-time-no-lighting.jpg` as the main wide composition reference: both desk runs, cabinets framing the sides, bunk at the right rear, windows at the far end, and a readable central floor passage. Use `room-day-time-lighting.jpg` and `room-night-time.jpg` to compare warm and cool lighting. Use `room-day-time-no-lighting-left-view.png` for the whiteboard, shelves, small appliances and hanging cables. The top view supports proportions and object placement. The zoomed-in image is for detail inspection, not the main camera framing.

The Blender draft establishes the wide composition with tall cabinets, both desks and chairs, separate whiteboard and pinned paper layers, book shelves, monitors/keyboard/laptop, a relocated desk fan, pillows, wavy quilts and a hanging throw, cables, cups, comics and T-shirt silhouettes. The second detail pass adds original surface maps, hardware, illustrated accents and everyday objects (listed below). These are modeled geometry and authored materials, not reference images used as scenery. Further art work should refine fabric silhouettes, larger illustrations and cinematic lighting while preserving interactive objects and camera targets.

## Editable room asset handoff — November 7

Blender 5.2.3 LTS was found at `/Applications/Blender.app/Contents/MacOS/Blender` and used in background mode through Python. No Blender MCP installation is needed. This is an original reconstruction informed by the supplied images and online research; it does not contain extracted film assets, downloaded third-party models, or the reference screenshots.

Artifacts:

- `context/models/room/room-draft.blend`: editable source, organized into collections for architecture, cabinetry, bedding, workstations, wall details, props, interaction anchors, lighting and cameras. Retains text, curves, bevel modifiers and separate furniture parts. Surface images are packed into the file.
- `public/models/room-draft.glb`: self-contained web export with evaluated modifiers, mesh lettering, materials, two point lights, named objects and custom properties.
- `context/models/room/previews/`: `wide-cool.png`, `wide-warm.png`, `left-detail.png`, `overhead.png`. These are Cycles renders of the model, not browser screenshots.
- `context/models/room/manifest.json` and `export-validation.json`: asset dimensions and measured export statistics. The first draft had 694 meshes; the integrated draft batches geometry down to 99 meshes while preserving interaction groups. Consult the validation report for the current byte size and triangle count.
- `scripts/blender/build_room.py`: deterministic scene generator and optional review renders. Regeneration **overwrites the draft**, so save manual Blender revisions separately first.
- `scripts/blender/export_room.py`: re-export an already saved `.blend` without regenerating the furniture or overwriting the source file. Converts text and curves, evaluates modifiers and batches meshes by parent and material only in the temporary background process. Named interaction groups and the independently hideable ceiling survive; arbitrary ungrouped decoration names do not. Give a future moving object a separate parent or a `keep_separate` custom property. Exact commands are in the repository README.
- `scripts/blender/room_details.py`: the second prop, illustration and hardware pass. `room_materials.py` creates original 256 × 256 color, normal and roughness maps and assigns UV coordinates. Generated PNGs live in `context/models/room/textures/`, are packed in the `.blend`, and embedded in the GLB.

Room dimensions are 4.8 m wide × 6.2 m deep × 3.1 m high. Blender axes are X across, positive Y into the room, Z up; glTF converts this to X across, Y up, negative Z into the room. The former open front at depth zero is now a wall with a closed door. `Entry_Anchor` sits in the rear window at Blender coordinates (-0.42, 6.25, 1.65); `Room_Overview` is just inside at (-0.42, 5.2, 1.65), aimed toward `Overview_Target` at (0, 1.9, 1.35). `src/room.js` applies scale 2, Y rotation π and translation (-0.84, -0.8, -12.5) to the glTF root. This maps the entrance to world (0, 2.5, 0), aligned with the exterior window. If the Blender window moves, update this transform and the validation contract together.

Named interaction groups and their exported `extras.interaction` values:

| Group              | Value        | Camera anchors                         |
| ------------------ | ------------ | -------------------------------------- |
| `About_Whiteboard` | `about`      | `View_About`, `Target_About`           |
| `Project_Notebook` | `projects`   | `View_Projects`, `Target_Projects`     |
| `Experience_Board` | `experience` | `View_Experience`, `Target_Experience` |
| `Record_Player`    | `records`    | `View_Records`, `Target_Records`       |

Groups currently sit at the origin with their geometry positioned in room coordinates; use the target anchors for camera framing, not the group origin. `Desk_Left` and `Desk_Right` also carry interaction metadata. Main-scene raycasting resolves the first visible mesh hit through its parents to an interactive group. The main scene wires these groups to camera zoom and accessible portfolio details.

Lighting: the `.blend` has soft window, front-fill, ceiling-bounce, monitor and desk-lamp area lights, plus two point accents. Area lights and Cycles global illumination are **not baked into the GLB**. The browser review uses its own area/fill rig, a shadow-casting directional light and reduced exported point-light intensities. The browser appearance is an approximation of the renders. Surface textures now cover wood, painted cabinetry, plaster, cork, rug and upholstery; these are material maps, not baked lightmaps.

This is a detailed layout draft, not final Spider-Verse-quality art or a mobile-certified asset. Before public release: refine silhouette and surface art, replace placeholder lettering with approved content, bake appropriate indirect lighting, and profile loading and rendering on physical phones. Static geometry is now batched, but added props increase triangles and textures increase the download size. Mesh counts are not frame-rate measurements or total draw calls (shadows add passes). The review viewer caps DPR at 1.5 and renders on interaction/resize. The main experience also caps DPR at 1.5 but retains its animation loop and postprocessing, so its performance must be measured separately.

Research: [Crystal Xie's original room study](https://www.therookies.co/entries/16566) describes a Miles Morales bedroom reconstruction informed by Yuhki Demers' interior concept, including warm/cool lighting studies and a lived-in atmosphere. It informed the research direction; our geometry and graphics were authored locally. Supplied wide references remain the primary layout guide.

### Second detail pass from the supplied artist links

The user supplied the Rookies page above, [Jack Bowman's Blender Artists room](https://blenderartists.org/t/miles-room/1376755), and [Crystal Xie's ArtStation project](https://crystalxie.artstation.com/projects/xJqJVO). All three pages were read. Bowman's full image and the local wide composition were visually inspected; the ArtStation page identifies day, evening and night studies, though its gallery API was unavailable. The additions interpret observed categories of detail rather than importing the artists' imagery or models.

Implemented details include cabinet door gaps, pulls and small edge chips; labeled book spines and shelf-supported archive boxes; original framed graphics, whiteboard diagrams and taped postcards; layered corkboard pictures; spiral notebook bindings and printed comic panels; a countertop cooker, pencil pot, snack tubs, drink cans and water bottle; headphones and controller; laptop keys; a backpack and wire wastebasket with crumpled paper; a small hoop and hanging net; mattress piping, crosswise quilt seams and less regular clothing folds; shoe tongues, seams and heel tabs. New color/normal/roughness maps make the same material detail available in both Blender and the browser.

The geometry remains separately editable in the Blender source. The export consolidates static parts within their parent groups. Validation checks embedded images, textured mesh UVs, surviving interaction geometry and a separately hideable ceiling, in addition to the existing GLB and camera-anchor checks.

## Window-entry integration and clipping corrections

The fan now sits on the left desk. The Blender window aperture has no sky plane, fixed sash or blinds blocking the camera; the main website supplies the animated sash. The quilt remains below the safety rail, the ladder is at the foot of the bunk clear of the hanging quilt, and the purple throw wraps around the upper rail near the pillows, away from the quilt. These targeted corrections were visually reviewed; this is not a certification that every decorative mesh is collision-free.

The former opposite opening is filled by a wall and a simple closed door. Review cameras, main entry travel and overview now face that door from the window. Object cameras still use the named Blender `View_*` and `Target_*` anchors, so those can be adjusted visually without rewriting interaction code. Camera focus takes 950 ms, or 100 ms with reduced motion. The overview and close-up inspections permit limited horizontal and vertical look-around; there is no free walking through furniture. Portrait entry turns toward the desk/whiteboard for a more useful narrow-screen composition.

The main page waits for the model before enabling entry/replay, presents a small loading indicator, and exposes a retry/readable fallback on model or WebGL failure. Clicking an object now zooms first. Reading details is a separate optional action. Portfolio copy remains provisional. The existing three-input paper and five-input window sequence, replay, visit persistence and reduced-motion behavior are preserved.

For manual Blender work, edit and save `room-draft.blend`, then run `scripts/blender/export_room.py` and `node scripts/validate-room.mjs`. Do **not** regenerate with `build_room.py` after manual edits unless intentionally replacing them. Keep the interaction groups and anchors, and leave the entry aperture open. The runtime handles the intro animations; the room does not need to be rebuilt as one monolithic animated asset.

Art direction: target a cinematic illustrated finish with carefully shaped fabric, material variation and composed lighting. Sony's [production overview](https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse) describes mixing 3D rendering styles with hand-drawn elements. Photorealism is a separate direction. A rough planning estimate for a single experienced environment artist is several focused days for a meaningful material/lighting improvement and several weeks for a polished small environment; fidelity, revisions and mobile optimization determine the actual effort.

## Performance and detailed-room options — discussion only

The main portfolio now uses the Blender/GLB room, including camera inspection and raycast interactions. Light baking and physical-device performance profiling remain pending. A constrained camera would let us focus geometry and texture detail on visible areas and retain a few dynamic accent lights.

C++ compiled to WebAssembly can be useful for CPU-heavy simulation, physics or established C++ systems. It still reaches the browser GPU through a graphics API and does not inherently reduce shader, shadow, texture or overdraw costs. Diagnose CPU versus GPU limits on the affected devices before choosing a rewrite. Existing lights, postprocessing, pixel count and draw submissions are profiling candidates, not measured diagnoses.

Raylib can be compiled for the web with Emscripten and is feasible for a more game-oriented runtime, but it adds a C/C++ build pipeline and a renderer/input/UI migration. Dear ImGui is useful for developer-facing scene tools; its own project describes a tooling focus and lacks accessibility features, so browser DOM overlays remain the preferred public portfolio panels. No C++/WASM, Raylib, ImGui or general performance overhaul was implemented. The GLB loader is used by both the main experience and the model review page.

Primary references for the discussion:

- https://emscripten.org/docs/optimizing/Optimizing-WebGL.html
- https://threejs.org/docs/pages/GLTFLoader.html
- https://threejs.org/docs/pages/Raycaster.html
- https://github.com/raysan5/raylib/wiki/Working-for-Web-(HTML5)
- https://github.com/ocornut/imgui

## Validation and handoff

Run `npm test` for deterministic momentum tests, `npm run test:e2e` for Chrome browser checks, and `npm run build` for the production bundle. Browser tests use locally installed Chrome and can start/reuse the Vite server. Test screenshots are saved under the operating system temporary directory. Playwright artifacts are ignored by Git.

Run `node scripts/validate-room.mjs` after each model export to check GLB structure, named anchors, interaction metadata and mesh counts. `npm run test:e2e` verifies that the actual GLB loads, review views and lighting controls work, the layout fits a 390 px viewport, and no uncaught browser errors occur. This viewport check is not a physical-device performance benchmark. Blender renders are visually reviewed for layout, intersections and composition.

Validate exterior, window and interior composition at mobile and desktop widths. Browser coverage includes normal/reduced motion, skip, replay, persistence, blocked storage, details/help, keyboard interaction and unavailable WebGL. Physical mobile hardware, Safari/Firefox and performance profiling remain release checks; no device frame-rate or LCP target has yet been certified.

Next creative work: review the geometry, lighting and composition against the references; refine materials and furniture shapes; replace provisional content with approved portfolio details. Later consider richer physics or lighting only after profiling. C++/WebAssembly is an exploration, not an assumed optimization. The minigame and audio need a separate design decision.

Deployment remains controlled by the existing Vercel Git integration and GitHub workflow. No push or deployment is part of this implementation.

Motion reference: https://www.youtube.com/watch?v=U1NiPzTkfP8 (not visually verified).

## Original creative notes

The following preserves the user’s exploratory ideas; the confirmed decisions above take precedence.

- Compatible with web + mobile (focus on keeping main clickable action buttons in center and keep the sides meant for extending the scene so that we can just trim size on mobile and make it dynamic)
- Spiderman themed, not sure if I want this animated or keep it a real scene yet, but I'll decide based on how we place objects and whatever ends up being easier.
- Action for mobile generally means tapping the screen a certain amount of times, and then action for web generally means clicking the screen a certain amount of times where we'll have different amount of times depending on "roughness" of action

- Scene 1: facing fire exit of building with window in center of screen
- Scene 2: the room that will be the main "scene" of this website, it'll store a room of spiderman/miles morales where there's a lot of clickable items that they can click and go through just like in the spiderman game, we'll keep this ambiguous right now until we decide animated/real-life visual as well as where we're getting the room png from or if we're creating from scratch, etc.

Workflow:

- page loads in and initially we're at scene 1, then a "My name is _" tag flies into scene, and the user can do repeated actions to force it to peel off or fly away which then takes us back to scene 1 with an action prompt to open the window
- once the user opens the window, it should zoom into scene 2 without making the transition obvious
- the user is allowed to click on each actionable item, and learn different things, i.e., something on the table such as a blueprint paper might go over a project of mine, and these blueprints can be scattered throughout, a whiteboard might be used to represent an introduction to me, meanwhile we might use a notebook to represent the different experiences, etc. or even represent images on some billboard in chronological order that go over the times, role, etc. theres a lot of creativity here in terms of what we want to do, so we'll leave this part empty
- actionable items will need to be highlighted, or maybe there's a haptic feedback where as you get closer to an item, it starts to levitate, and you get haptic feedback back just like in a controller (computer or phone vibrates), OR since computer vibrations are iffy, we can have the screen go into a spidey sense mode the closer it gets to something it can click thats actionable
- for people who would generally confused with a broader website where it's more so "free for all" and you have no proper direction like in a normal website, we can include a help button on the top right or somewhere in teh room to guide them through teh different actionable objects
- lastly, we need there to be something interactive like a mini game, so that there's more to do beyond just explore the room, i.e., mini game like ping pong or osmething very basic, or what id prefer is if we can do something with spiderman's ability to shoot webs, not sure what yet, that's also much later, but I know I want it to be something not that basic at all yet still involved in the room

Again, this is all relatively not in place, but this is where we are going to be starting, so some questions to maybe answer are:

- where are we getting these assets
- what sort of haptic feedback are we implementing visually or touch-based that helps make this feel like the spiderman ps4 game (not exactly, but u get the idea)
- what other actionable items can we come up besides the basic ones, i.e., maybe the record player can play different music from teh different vinyl on the wall or something, etc.
- we mainly need to research on what's in spiderman's room since we need to recreate it relatively well, also note that spiderman's room was almost always relatively dirty, so we need to take into consideration dirty clothes on the floor and what not to make it feel nice

## Repository cleanup and handoff

The temporary room-preview HTML route, viewer module and viewer-only test have been removed. The main experience is the supported entry point. Exterior geometry, postprocessing, UI markup and content now have dedicated modules. Blender structure and furnishings are separated from build orchestration. Earlier mentions of a separate viewer describe the development process; it is no longer shipped. Run `npm run check` and `npm run test:e2e` before pushing. The source `.blend`, texture sources, reference assets and authored GLB are retained for future editing.
