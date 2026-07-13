# SkinForge — Build 01

An offline-first, mobile-responsive PWA starter for designing original game-character concepts and coordinated cosmetic sets.

## Build 01 includes

- Character design canvas
- Upload reference images
- Freehand drawing
- Shape and text layers
- Layers with selection, visibility, locking, duplication, deletion
- Per-layer position, size, rotation, and opacity
- Front / side / back view switching
- Outfit, Gear, Styles, Lore, and Submission workspaces
- Character accessory concept buttons
- Local autosave
- Undo / redo
- PNG export
- Basic concept analyzer
- PWA manifest and offline service worker
- Responsive phone, tablet, and desktop layout

## Run locally

Because this is a PWA, serve the folder through a local web server instead of double-clicking `index.html`.

### VS Code
Use the Live Server extension.

### Python
```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

Upload every file and folder from this ZIP to the repository root. In GitHub:

1. Open **Settings**
2. Select **Pages**
3. Deploy from the chosen branch
4. Select the repository root
5. Save

## Data

Projects are stored in the browser using localStorage. Clearing browser storage removes the local project. Cloud sync is intentionally not included in Build 01.
