# 3D Data Globe — Interactive Population Visualization

A real-time 3D globe built with Three.js and React that visualizes world population data. Country borders rendered from GeoJSON, data-driven spikes with smooth animations, raycasting tooltips, and full interactivity.

**Live Demo:** [Coming soon — deploy to Vercel]

## Features

- **3D Globe** with real country borders from GeoJSON data
- **195 countries** with population data mapped to spike height and color
- **Raycasting tooltips** — hover over any spike to see country name and population
- **Animated camera intro** — cinematic fly-in on page load, skippable on interaction
- **Play/Pause toggle** — control globe auto-rotation
- **Interactive control panel** — filter by minimum population, adjust spike height
- **Smooth animations** — target-based lerp system, no flicker on updates
- **Dark/Light mode** — scene background and globe respond to theme toggle
- **Loading screen** with progress indicator
- **Responsive** — ResizeObserver keeps the canvas correct on any viewport

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| 3D Engine | Three.js 0.184 |
| Build Tool | Vite 8 |
| State | Redux Toolkit |
| UI Components | Custom design library |
| Deploy | Vercel (static) |

## Architecture

```
src/
├── hooks/
│   └── useThreeScene.ts      # Core Three.js abstraction
├── utils/
│   ├── geoToSphere.ts        # Lat/lng → 3D coordinate conversion
│   ├── buildGlobeBorders.ts   # GeoJSON → LineSegments
│   ├── buildDataPoints.ts     # Creates spike meshes (once)
│   └── updateDataPoints.ts    # Updates targets (no rebuild)
├── components/
│   ├── ThreeScene.tsx         # Scene composition
│   ├── ControlPanel.tsx       # Slider UI
│   ├── Tooltip.tsx            # Raycasting tooltip
│   └── LoadingScreen.tsx      # Progress overlay
├── store/
│   ├── index.ts
│   ├── hooks.ts               # Typed useAppDispatch/useAppSelector
│   └── slices/
│       ├── themeSlice.ts
│       ├── animationSlice.ts
│       └── controlsSlice.ts
└── main.tsx
```

### Key Design Decisions

**`useThreeScene` hook — clean separation of concerns**

All Three.js setup (renderer, camera, controls, resize handling, animation loop) lives in a single custom hook. The component only adds scene objects and registers an animation callback via `onAnimate()`. This keeps JSX clean and makes the Three.js logic testable and reusable.

**Why `BufferGeometry` + `CylinderGeometry` for data spikes**

Each country gets a unit-height cylinder positioned on the sphere surface using spherical coordinate math. `BufferGeometry` is the only geometry type in modern Three.js — it stores vertex data in typed arrays on the GPU, which is what makes 195 spikes renderable at 60fps.

**Target-based animation instead of destroy/rebuild**

When sliders change, we don't destroy and recreate meshes. Instead, `updateDataPointTargets()` sets `userData.targetScaleY` and `userData.targetOpacity` on each mesh. The animation loop lerps toward these targets every frame. This eliminates flicker, avoids garbage collection pressure, and keeps the frame budget under 16ms.

**No allocations in the animation loop**

The animation callback never creates `new THREE.Vector3()`, never calls `.clone()`, never spreads arrays. All objects are created once during setup. The loop only mutates existing values. This is the difference between 60fps and 15fps on a mid-range laptop.

**Raycasting for 3D-to-screen-space mapping**

On `mousemove`, a `Raycaster` casts from the camera through the normalized mouse position into the scene. If it intersects a spike mesh, we read `userData` (country, value) and position an HTML tooltip at the cursor. This bridges the 3D world and the DOM — a common interview talking point.

**Coordinate conversion: lat/lng → sphere surface**

Geographic coordinates are converted to 3D points using spherical coordinate math:
- `phi = (90 - lat)` converts latitude to polar angle from north pole
- `theta = (lng + 180)` shifts longitude for Three.js coordinate system
- Standard spherical-to-cartesian formula places the point on the sphere

**Multi-stop color gradient**

Spikes use a 5-stop gradient (green → yellow → orange → red → magenta) mapped to normalized population. This avoids the blue border color and provides clear visual differentiation across 195 data points.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Sources

- **Country borders:** GeoJSON from [world.geo.json](https://github.com/johan/world.geo.json)
- **Population data:** World population estimates (millions), embedded as static JSON

## Performance

- 60fps on mid-range hardware
- No object allocation in animation loop
- `mesh.visible = false` for filtered spikes (skips GPU rendering entirely)
- ResizeObserver instead of window resize (catches all layout changes)
- Debounced slider dispatch to prevent excessive re-computation
- Single fetch on mount — slider changes only update targets, no network requests

## License

MIT
