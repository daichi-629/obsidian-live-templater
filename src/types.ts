import type { TemplateFieldMap } from "./template";

export const DATA_INPUT_VIEW_TYPE = "live-templater-data-input";

export type FileTemplateData = {
	values: TemplateFieldMap;
	applyToMarkdownView: boolean;
};

export type LiveTemplaterData = {
	files: Record<string, FileTemplateData>;
};

export const DEFAULT_FILE_TEMPLATE_DATA: FileTemplateData = {
	values: {},
	applyToMarkdownView: false
};

export const DEFAULT_PLUGIN_DATA: LiveTemplaterData = {
	files: {}
};
