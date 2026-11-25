# Yash Parmar — After Hours

A cinematic portfolio set inside a connected 3D building and bedroom. Built with Vite, native JavaScript and Three.js, with a Blender-authored room, real lighting, shadows and a camera journey from the fire escape through the window.

See [project context](context/docs/description.md) for the experience, references, implementation decisions and remaining work.

## Development

Use Node.js 22. Run `npm ci`, then `npm run dev`.

- `npm run check`: lint, formatting, unit tests, model validation and production build.
- `npm run format`: apply the shared source formatting.
- `npm run build`: production build in `dist/`.
- `npm run preview`: preview the production build.
- `npm test`: deterministic interaction tests.
- `npm run test:e2e`: browser checks using an installed Google Chrome; starts or reuses the local Vite server.

The scene requires WebGL 2 and includes a readable fallback. Portfolio copy is drawn from Yash’s public GitHub and LinkedIn profiles; Records retains its placeholder until a later career-focused redesign. Reference images in `context/assets` guide the scene design and are not bundled into the website.

## Editable room draft

Open [room-draft.blend](context/models/room/room-draft.blend) in Blender to edit the furniture, props, materials and lights. The illustrated finish includes collision-settled bedding, constructed furniture, worn material maps, original printed artwork and detailed inspection surfaces. Review the [entry view](context/models/room/previews/wide-cool.png), [reverse view](context/models/room/previews/reverse.png), [bunk](context/models/room/previews/bed-detail.png), [desk](context/models/room/previews/left-detail.png), [right wall](context/models/room/previews/right-detail.png), [overhead layout](context/models/room/previews/overhead.png), or [warm lighting study](context/models/room/previews/wide-warm.png).

The main page loads the room through the fire-escape window. Select an object to zoom in and read its text directly on the whiteboard, notebook, pinned sheet or record sleeve. The red circle button or Escape returns to the room; drag/swipe to look around. The bottom-right dock contains replay, a visual control guide and a four-way comic-style navigation wheel. The temporary model-preview route has been removed. Further content curation and physical-phone profiling remain release work.

The review images above are Cycles renders from the room-art pass, before the latest reading surfaces. [Desktop](context/models/room/previews/browser-desktop.png) and [mobile](context/models/room/previews/browser-mobile.png) browser captures show the real-time lighting, framing and interaction prompts.

Review the [desktop control guide](context/models/room/previews/help-desktop.png), [phone control guide](context/models/room/previews/help-mobile.png), [desktop menu](context/models/room/previews/menu-desktop.png), [phone menu](context/models/room/previews/menu-mobile.png), and phone reading views of the [whiteboard](context/models/room/previews/reading-mobile-about.png) and [notebook](context/models/room/previews/reading-mobile-projects.png).

After editing and saving the `.blend`, re-export it without rebuilding the furniture:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/export_room.py
node scripts/validate-room.mjs
```

To render the saved model from all seven review views without changing it:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/review_room.py
```

The optional `audit_room.py` checks the fixed camera-anchor contract, window-entry clearance and quilt contact with mattresses and bed frames. This is a focused geometry check, not a general collision solver.

On supported Apple hardware, append `-- --metal` to the review command to use Metal GPU rendering. Omit it to use CPU rendering; `-- --quick` produces smaller draft images.

To regenerate the finished room from code (overwrites the draft, including manual edits):

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 --python scripts/blender/build_room.py
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/polish_room.py -- --settle
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/add_reading_surfaces.py
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/export_room.py
node scripts/validate-room.mjs
```

Blender 5.2.3 LTS was used. Blender MCP is not required. Source texture PNGs are in `context/models/room/textures/` and packed into the `.blend`. The GLB embeds the surface maps and smaller JPEG copies of the two prints. Their built-in imagegen prompts and provenance are in [art-provenance.json](context/models/room/art-provenance.json).

Export batches static geometry by parent and material, bakes short-range contact shading into vertex colors, and compresses the geometry with Meshopt. The decoder ships with the application, without a CDN dependency. Validation decodes every compressed buffer as well as checking the interaction contract. Contact shading is recalculated on each export and adds no runtime postprocessing pass. The source stays individually editable; cloth simulation is already applied, so it does not run in the browser. See [project context](context/docs/description.md) for reference attribution, coordinate conventions and interaction anchors.

## In-scene portfolio copy

Edit `src/content.js`; `src/scene-print.js` paints the same text onto the four UV-mapped reading surfaces at load time and supplies a compact whiteboard layout for portrait screens. Camera framing fits each physical surface to the viewport. A screen-reader transcript mirrors the text without adding a visible panel.

To update the packed Blender lettering too, start `npm run dev`, run `node scripts/build-scene-prints.mjs`, then run Blender with `--python scripts/blender/add_reading_surfaces.py` followed by `--python scripts/blender/export_room.py`. The surface migration replaces the four reading areas, so do not rerun it after manually editing those areas unless intending to restore the authored layouts. Preserve `contentSurface` and `keep_separate` metadata when editing their geometry. All other furniture and entrance anchors are preserved.

## Deployment

The existing GitHub workflow builds on pushes to `dev` and pull requests targeting `main`. Vercel deployment is managed separately by its GitHub integration. Pushing a feature branch may create a preview deployment.
