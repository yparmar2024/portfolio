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

The scene requires WebGL 2 and includes a readable fallback. Portfolio details are provisional. Reference images in `context/assets` guide the scene design and are not bundled into the website.

## Editable room draft

Open [room-draft.blend](context/models/room/room-draft.blend) in Blender to edit the furniture, props, materials and lights. The second detail pass adds textured surfaces, cabinet hardware, wall illustrations, desk accessories and floor props. Review the [wide cool render](context/models/room/previews/wide-cool.png), [warm render](context/models/room/previews/wide-warm.png), [whiteboard view](context/models/room/previews/left-detail.png), or [overhead layout](context/models/room/previews/overhead.png).

The main page loads the room through the fire-escape window. Select an object to zoom in, use the document icon to read details, or the arrow/Escape to return; drag/swipe to look around. The temporary model-preview route has been removed. Final materials, portfolio content and physical-phone profiling remain release work.

After editing and saving the `.blend`, re-export it without rebuilding the furniture:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background context/models/room/room-draft.blend --python-exit-code 1 --python scripts/blender/export_room.py
node scripts/validate-room.mjs
```

To regenerate the original draft and all four renders from code (overwrites the draft, including manual edits):

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 --python scripts/blender/build_room.py -- --render
node scripts/validate-room.mjs
```

Blender 5.2.3 LTS was used. Blender MCP is not required. Source texture PNGs are in `context/models/room/textures/` and packed into the `.blend` and GLB. Export batches static geometry by parent and material; the Blender source stays individually editable. See [project context](context/docs/description.md) for reference attribution, coordinate conventions, interaction anchors and remaining art work.

## Deployment

The existing GitHub workflow builds on pushes to `dev` and pull requests targeting `main`. Vercel deployment is managed separately by its GitHub integration. Pushing a feature branch may create a preview deployment.
