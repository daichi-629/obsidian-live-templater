import { parseTemplate } from "./template";

export async function renderTemplateTextParts<T>(
	text: string,
	values: Record<string, string>,
	renderValue: (value: string) => Promise<T[]>
): Promise<Array<string | T[]> | null> {
	const tokens = parseTemplate(text);
	if (tokens.length === 0) {
		return null;
	}

	const parts: Array<string | T[]> = [];
	let offset = 0;
	let changed = false;

	for (const token of tokens) {
		const before = text.slice(offset, token.start);
		if (before) {
			parts.push(before);
		}

		const value = values[token.key];
		if (value === undefined) {
			parts.push(token.raw);
		} else {
			parts.push(await renderValue(value));
			changed = true;
		}

		offset = token.end;
	}

	const after = text.slice(offset);
	if (after) {
		parts.push(after);
	}

	return changed ? parts : null;
}
