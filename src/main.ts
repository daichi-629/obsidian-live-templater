import { Plugin, TFile } from "obsidian";
import type { TemplateFieldMap } from "./template";
import { DataInputView } from "./data-input-view";
import { DATA_INPUT_VIEW_TYPE, type FileTemplateData, type LiveTemplaterData } from "./types";
import { getFileData, normalizePluginData, setFileApplyToMarkdownView, setFileValues } from "./data-store";
import { renderTemplatePlaceholders } from "./markdown-renderer";
import {
	activateDataInputView,
	canReflectInMarkdownView,
	refreshDataInputViews,
	refreshMarkdownViews
} from "./workspace-views";

export default class LiveTemplaterPlugin extends Plugin {
	private data: LiveTemplaterData = {
		files: {}
	};

	async onload() {
		this.data = normalizePluginData(await this.loadData());

		this.registerView(DATA_INPUT_VIEW_TYPE, (leaf) => new DataInputView(leaf, this));

		this.addCommand({
			id: "open-data-input",
			name: "Open data input",
			callback: () => {
				void activateDataInputView(this.app);
			}
		});

		this.registerMarkdownPostProcessor((element, context) => {
			renderTemplatePlaceholders(this.data, element, context.sourcePath);
		});

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				void refreshDataInputViews(this.app);
			})
		);
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				void refreshDataInputViews(this.app);
			})
		);
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				void refreshDataInputViews(this.app);
			})
		);
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile && file.extension === "md") {
					void refreshDataInputViews(this.app);
					refreshMarkdownViews(this.app, file.path);
				}
			})
		);
	}

	getFileTemplateData(path: string): FileTemplateData {
		return getFileData(this.data, path);
	}

	async setFileTemplateValues(path: string, values: TemplateFieldMap) {
		this.data = setFileValues(this.data, path, values);
		await this.saveData(this.data);
	}

	async setFileApplyToMarkdownView(path: string, applyToMarkdownView: boolean) {
		this.data = setFileApplyToMarkdownView(this.data, path, applyToMarkdownView);
		await this.saveData(this.data);
	}

	canReflectInMarkdownView(path: string): boolean {
		return canReflectInMarkdownView(this.app, path);
	}

	refreshMarkdownViews(path: string) {
		refreshMarkdownViews(this.app, path);
	}

}
