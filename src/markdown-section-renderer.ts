import { MarkdownRenderer, type App, type Component, type MarkdownPostProcessorContext } from "obsidian";
import { renderTemplate } from "./template";
import type { FileTemplateData } from "./types";

export async function renderTemplateMarkdownSection(
	app: App,
	component: Component,
	fileData: FileTemplateData,
	element: HTMLElement,
	context: MarkdownPostProcessorContext
): Promise<boolean> {
	const section = context.getSectionInfo(element);
	if (!section) {
		return false;
	}

	const renderedMarkdown = renderTemplate(section.text, fileData.values);
	if (renderedMarkdown === section.text) {
		return true;
	}

	const container = document.createElement("div");
	await MarkdownRenderer.render(app, renderedMarkdown, container, context.sourcePath, component);
	element.replaceChildren(...Array.from(container.childNodes));

	return true;
}
