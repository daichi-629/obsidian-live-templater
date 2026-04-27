# Live Templater

Live Templater is an Obsidian plugin for rendering markdown files that contain simple template placeholders.

The first supported syntax is:

```text
{{key}}
```

For each markdown file, the plugin extracts template keys, lets you enter values in a dedicated data input view, and can render the expanded result without modifying the markdown source.

## Features

- Extracts `{{key}}` placeholders from the active markdown file
- Provides a dedicated data input view for per-key values
- Saves entered data per file and restores it when the file is opened again
- Copies the rendered markdown to the browser Clipboard API
- Writes the rendered markdown to a vault file path entered in a modal
- Optionally reflects rendered values in the markdown preview HTML without rewriting the source file

## Usage

1. Open a markdown file that contains placeholders such as `{{name}}`.
2. Run the command `Open data input`.
3. Enter values for the extracted keys in the Live Templater data view.
4. Use `Copy to clipboard` or `Copy to file` to export the rendered markdown.
5. Enable `Reflect in view` to show rendered values in the markdown view.

The markdown file itself is not changed when `Reflect in view` is enabled. Only rendered HTML text nodes in the markdown view are replaced.

## Development

This repository is a minimal pnpm project for Obsidian plugin development.

```text
src/       Plugin code and template rendering helpers
__tests__/ Template parsing and rendering tests
vault/     Local development vault
```

Run commands from the repository root:

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run test
```

The Docker-based development environment can be started with:

```bash
docker compose up -d
./bin/obsidian-dev pnpm install
./bin/obsidian-dev pnpm run dev
```

After the container starts, open Obsidian in your browser at <http://localhost:3000>.

During watch and build runs, publishable plugin files are copied to:

```text
vault/.obsidian/plugins/live-templater/
```

## Release Artifacts

The publishable plugin files are:

- `main.js`
- `manifest.json`
- `styles.css`

When bumping versions, keep `manifest.json` and `versions.json` aligned.

## Acknowledgements

This repository uses the Obsidian sample plugin workflow as its base.
