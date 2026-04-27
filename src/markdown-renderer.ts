import type { App, Component, MarkdownPostProcessorContext } from "obsidian";
import { isTemplateValueRenderElement, renderTemplateTextNodes } from "./text-node-renderer";
import { DEFAULT_FILE_TEMPLATE_DATA, type LiveTemplaterData } from "./types";

export async function renderTemplatePlaceholders(
	app: App,
	component: Component,
	data: LiveTemplaterData,
	element: HTMLElement,
	context: MarkdownPostProcessorContext
) {

	if (isTemplateValueRenderElement(element)) {
		// Rendered values may contain markdown; skip those subtrees to avoid recursive replacement.
		return;
	}

	const fileData = data.files[context.sourcePath] ?? DEFAULT_FILE_TEMPLATE_DATA;
	if (!fileData.applyToMarkdownView) {
		// Reflection is opt-in per file so normal reading mode is left untouched by default.
		return;
	}

	await renderTemplateTextNodes(app, component, element, fileData.values, context.sourcePath);
}
