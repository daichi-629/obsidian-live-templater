# Obsidian Live Templater

## First Read

- This repository is a minimal pnpm project for the Live Templater Obsidian plugin.
- Use [`docs/development-flow.md`](/home/daichi/ghq/github.com/daichi-629/obsidian-live-templater/docs/development-flow.md) as the source of truth for the Docker-based workflow, ports, and local vault setup.
- For reusable Obsidian plugin guidance, load the local skill at [`.codex/skills/obsidian-plugin-dev/SKILL.md`](/home/daichi/ghq/github.com/daichi-629/obsidian-live-templater/.codex/skills/obsidian-plugin-dev/SKILL.md) and then read only the references you need.

## Repository Layout

- `src/`: Obsidian plugin code, React view modules, and template parsing/rendering helpers.
- `__tests__/`: Template parsing, key extraction, and rendering tests.
- `manifest.json`, `versions.json`, `styles.css`, `esbuild.config.mjs`, and `main.js`: plugin metadata, styles, build config, and bundled output.
- `vault/`: Local development vault. Watch builds copy the publishable plugin files into `vault/.obsidian/plugins/live-templater/`.

## Architecture Rules

- Keep template syntax parsing and rendering logic isolated in `src/template.ts`.
- Keep `src/main.ts` focused on plugin lifecycle and registration. Move reusable plugin UI or storage details into focused modules under `src/`.
- Use React for the data input view.
- Use Obsidian CSS variables in `styles.css`.
- Use the browser Clipboard API for clipboard writes; do not add Node/Electron clipboard code.

## Working Rules

- Run workspace commands from the repository root with `pnpm`.
- Prefer the root scripts: `pnpm run dev`, `pnpm run build`, `pnpm run lint`, and `pnpm run test`.
- When the containerized workflow matters, use `./bin/obsidian-dev ...` as described in [`docs/development-flow.md`](/home/daichi/ghq/github.com/daichi-629/obsidian-live-templater/docs/development-flow.md).
- Keep plugin IDs, command IDs, view types, and persisted data keys stable unless the user explicitly asks to change them.
- When changing release metadata, keep `manifest.json` and `versions.json` aligned.
- Respect the build pipeline in `esbuild.config.mjs`. Dev/watch runs copy `main.js`, `manifest.json`, and `styles.css` into the vault plugin directory and update `.hotreload`.

## Validation

- For plugin behavior or build changes, run `pnpm run build` or `pnpm run dev`.
- For shared template logic changes, run `pnpm run test`.
- For style or TypeScript changes, run `pnpm run lint`.
- If the task changes versioning or release flow, verify `manifest.json` and `versions.json` together.
