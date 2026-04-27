export type TemplateFieldMap = Record<string, string>;

export type TemplateToken = {
	type: "placeholder";
	key: string;
	raw: string;
	start: number;
	end: number;
};

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

export function parseTemplate(source: string): TemplateToken[] {
	const tokens: TemplateToken[] = [];

	for (const match of source.matchAll(PLACEHOLDER_PATTERN)) {
		const raw = match[0];
		const key = match[1];
		const start = match.index ?? 0;

		tokens.push({
			type: "placeholder",
			key,
			raw,
			start,
			end: start + raw.length
		});
	}

	return tokens;
}

export function extractTemplateKeys(source: string): string[] {
	const keys = new Set<string>();

	for (const token of parseTemplate(source)) {
		keys.add(token.key);
	}

	return Array.from(keys).sort((left, right) => left.localeCompare(right));
}

export function renderTemplate(source: string, values: TemplateFieldMap): string {
	return source.replace(PLACEHOLDER_PATTERN, (raw: string, key: string) => values[key] ?? raw);
}
