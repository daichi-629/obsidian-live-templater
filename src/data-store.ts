import type { TemplateFieldMap } from "./template";
import type { LiveTemplaterData, FileTemplateData } from "./types";
import { DEFAULT_FILE_TEMPLATE_DATA, DEFAULT_PLUGIN_DATA } from "./types";

// Plugin data comes from disk and may be absent or from an older version.
export function normalizePluginData(data: unknown): LiveTemplaterData {
	if (!isRecord(data) || !isRecord(data.files)) {
		return { ...DEFAULT_PLUGIN_DATA };
	}

	const files: LiveTemplaterData["files"] = {};
	for (const [path, fileData] of Object.entries(data.files)) {
		files[path] = normalizeFileData(fileData);
	}

	return { files };
}

export function getFileData(data: LiveTemplaterData, path: string): FileTemplateData {
	return data.files[path] ?? DEFAULT_FILE_TEMPLATE_DATA;
}

export function setFileValues(
	data: LiveTemplaterData,
	path: string,
	values: TemplateFieldMap
): LiveTemplaterData {
	const current = getFileData(data, path);
	return {
		...data,
		files: {
			...data.files,
			[path]: {
				...current,
				values
			}
		}
	};
}

export function setFileApplyToMarkdownView(
	data: LiveTemplaterData,
	path: string,
	applyToMarkdownView: boolean
): LiveTemplaterData {
	const current = getFileData(data, path);
	return {
		...data,
		files: {
			...data.files,
			[path]: {
				...current,
				applyToMarkdownView
			}
		}
	};
}

function normalizeFileData(data: unknown): FileTemplateData {
	if (!isRecord(data)) {
		return { ...DEFAULT_FILE_TEMPLATE_DATA };
	}

	return {
		values: normalizeValues(data.values),
		applyToMarkdownView:
			typeof data.applyToMarkdownView === "boolean"
				? data.applyToMarkdownView
				: DEFAULT_FILE_TEMPLATE_DATA.applyToMarkdownView
	};
}

function normalizeValues(values: unknown): TemplateFieldMap {
	if (!isRecord(values)) {
		return {};
	}

	// Discard malformed persisted entries instead of failing plugin load.
	const normalized: TemplateFieldMap = {};
	for (const [key, value] of Object.entries(values)) {
		if (typeof value === "string") {
			normalized[key] = value;
		}
	}

	return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
