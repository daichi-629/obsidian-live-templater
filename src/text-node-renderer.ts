import { MarkdownRenderer, type App, type Component } from "obsidian";
import { parseTemplate, type TemplateToken } from "./template";
import { renderTemplateTextParts } from "./template-text-parts";

const TEMPLATE_VALUE_RENDER_ROOT_ATTRIBUTE = "data-live-templater-value-render-root";
const TEMPLATE_VALUE_RENDER_ROOT_SELECTOR = `[${TEMPLATE_VALUE_RENDER_ROOT_ATTRIBUTE}]`;

export function isTemplateValueRenderElement(element: HTMLElement): boolean {
	return Boolean(element.closest(TEMPLATE_VALUE_RENDER_ROOT_SELECTOR));
}

export async function renderTemplateTextNodes(
	app: App,
	component: Component,
	element: HTMLElement,
	values: Record<string, string>,
	sourcePath: string
) {
	await replaceTextNodes(element, (node) =>
		renderTemplateTextFragment(app, component, node, values, sourcePath)
	);
}

async function replaceTextNodes(root: HTMLElement, replace: (node: Text) => Promise<Node | null>) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];

	while (walker.nextNode()) {
		const node = walker.currentNode;
		if (node instanceof Text && !isIgnoredTextNode(node)) {
			nodes.push(node);
		}
	}

	for (const node of nodes) {
		if (!node.isConnected) {
			continue;
		}

		const replacement = await replace(node);
		if (replacement) {
			replaceNodeWithRenderedValue(node, replacement);
		}
	}
}

async function renderTemplateTextFragment(
	app: App,
	component: Component,
	node: Text,
	values: Record<string, string>,
	sourcePath: string
): Promise<Node | null> {
	const text = node.nodeValue ?? "";
	const parts = await renderTemplateTextParts(text, values, (value) =>
		renderMarkdownValue(app, component, value, sourcePath)
	);

	if (!parts) {
		return null;
	}

	const fragment = document.createDocumentFragment();
	const unwrapParagraphs = !isWholeParagraphPlaceholder(node);
	for (const part of parts) {
		if (typeof part === "string") {
			appendText(fragment, part);
		} else {
			appendRenderedValue(fragment, part, { unwrapParagraphs });
		}
	}

	return fragment;
}

async function renderMarkdownValue(
	app: App,
	component: Component,
	value: string,
	sourcePath: string
): Promise<Node[]> {
	const container = document.createElement("div");
	container.setAttribute(TEMPLATE_VALUE_RENDER_ROOT_ATTRIBUTE, "");
	await MarkdownRenderer.render(app, value, container, sourcePath, component);

	return Array.from(container.childNodes);
}

function appendRenderedValue(
	fragment: DocumentFragment,
	nodes: Node[],
	options: { unwrapParagraphs: boolean }
) {
	fragment.append(...(options.unwrapParagraphs ? unwrapTopLevelParagraphs(nodes) : nodes));
}

function unwrapTopLevelParagraphs(nodes: Node[]): Node[] {
	const unwrapped: Node[] = [];

	for (const node of nodes) {
		if (node instanceof HTMLParagraphElement) {
			unwrapped.push(...Array.from(node.childNodes));
		} else {
			unwrapped.push(node);
		}
	}

	return unwrapped;
}

function appendText(fragment: DocumentFragment, text: string) {
	if (text) {
		fragment.append(document.createTextNode(text));
	}
}

function replaceNodeWithRenderedValue(node: Text, replacement: Node) {
	const parent = node.parentElement;
	if (isWholeParagraphPlaceholder(node) && replacement instanceof DocumentFragment) {
		parent?.replaceWith(replacement);
		return;
	}

	node.replaceWith(replacement);
}

function isWholeParagraphPlaceholder(node: Text): boolean {
	const parent = node.parentElement;
	if (parent?.tagName !== "P") {
		return false;
	}

	const text = node.nodeValue ?? "";
	const tokens = parseTemplate(text);
	if (tokens.length !== 1) {
		return false;
	}

	return isOnlyPlaceholderText(text, tokens[0]) && parent.textContent?.trim() === tokens[0].raw;
}

function isOnlyPlaceholderText(text: string, token: TemplateToken): boolean {
	return text.slice(0, token.start).trim() === "" && text.slice(token.end).trim() === "";
}

function isIgnoredTextNode(node: Text): boolean {
	const parent = node.parentElement;
	if (!parent) {
		return true;
	}

	return Boolean(parent.closest("code, pre, script, style, textarea"));
}
