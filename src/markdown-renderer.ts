import type { App, Component, MarkdownPostProcessorContext } from "obsidian";
import { debugLog } from "./debug";
import { isTemplateValueRenderElement, renderTemplateTextNodes } from "./text-node-renderer";
import { DEFAULT_FILE_TEMPLATE_DATA, type LiveTemplaterData } from "./types";

export async function renderTemplatePlaceholders(
	app: App,
	component: Component,
	data: LiveTemplaterData,
	element: HTMLElement,
	context: MarkdownPostProcessorContext
) {
	// debugLog("markdown post processor invoked", {
	// 	sourcePath: context.sourcePath,
	// 	tagName: element.tagName,
	// 	className: element.className,
	// 	textContent: element.textContent,
	// 	outerHTML: element.outerHTML
	// });

	if (isTemplateValueRenderElement(element)) {
		debugLog("markdown post processor skipped during template value rendering", {
			sourcePath: context.sourcePath
		});
		return;
	}

	const fileData = data.files[context.sourcePath] ?? DEFAULT_FILE_TEMPLATE_DATA;
	if (!fileData.applyToMarkdownView) {
		debugLog("markdown view reflection disabled", {
			sourcePath: context.sourcePath
		});
		return;
	}

	await renderTemplateTextNodes(app, component, element, fileData.values, context.sourcePath);
	debugLog("text node rendering complete", {
		sourcePath: context.sourcePath,
		textContent: element.textContent,
		outerHTML: element.outerHTML
	});
}
