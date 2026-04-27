import { parseTemplate } from "./template";

export function renderTemplateTextNodes(element: HTMLElement, values: Record<string, string>) {
	replaceTextNodes(element, (text) => renderTemplateTextFragment(text, values));
}

function replaceTextNodes(root: HTMLElement, replace: (text: string) => Node | null) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];

	while (walker.nextNode()) {
		const node = walker.currentNode;
		if (node instanceof Text && !isIgnoredTextNode(node)) {
			nodes.push(node);
		}
	}

	for (const node of nodes) {
		const replacement = replace(node.nodeValue ?? "");
		if (replacement) {
			node.replaceWith(replacement);
		}
	}
}

function renderTemplateTextFragment(text: string, values: Record<string, string>): Node | null {
	const tokens = parseTemplate(text);
	if (tokens.length === 0) {
		return null;
	}

	const fragment = document.createDocumentFragment();
	let offset = 0;
	let changed = false;

	for (const token of tokens) {
		appendText(fragment, text.slice(offset, token.start));

		const value = values[token.key];
		if (value === undefined) {
			appendText(fragment, token.raw);
		} else {
			appendValue(fragment, value);
			changed = true;
		}

		offset = token.end;
	}

	appendText(fragment, text.slice(offset));
	return changed ? fragment : null;
}

function appendValue(fragment: DocumentFragment, value: string) {
	const lines = value.split(/\r\n|\r|\n/);

	for (const [index, line] of lines.entries()) {
		if (index > 0) {
			fragment.append(document.createElement("br"));
		}
		appendText(fragment, line);
	}
}

function appendText(fragment: DocumentFragment, text: string) {
	if (text) {
		fragment.append(document.createTextNode(text));
	}
}

function isIgnoredTextNode(node: Text): boolean {
	const parent = node.parentElement;
	if (!parent) {
		return true;
	}

	return Boolean(parent.closest("code, pre, script, style, textarea"));
}
