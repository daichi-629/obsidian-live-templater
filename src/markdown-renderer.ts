import type { App, Component, MarkdownPostProcessorContext } from "obsidian";
import { renderTemplateMarkdownSection } from "./markdown-section-renderer";
import { renderTemplateTextNodes } from "./text-node-renderer";
import { DEFAULT_FILE_TEMPLATE_DATA, type LiveTemplaterData } from "./types";

export async function renderTemplatePlaceholders(
	app: App,
	component: Component,
	data: LiveTemplaterData,
	element: HTMLElement,
	context: MarkdownPostProcessorContext
) {
	const fileData = data.files[context.sourcePath] ?? DEFAULT_FILE_TEMPLATE_DATA;
	if (!fileData.applyToMarkdownView) {
		return;
	}

	const renderedSection = await renderTemplateMarkdownSection(app, component, fileData, element, context);
	if (!renderedSection) {
		renderTemplateTextNodes(element, fileData.values);
	}
}
