import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { createRoot, type Root } from "react-dom/client";
import { extractTemplateKeys, renderTemplate, type TemplateFieldMap } from "./template";
import { DataInputApp } from "./DataInputApp";
import { FileCopyModal } from "./file-copy-modal";
import { DATA_INPUT_VIEW_TYPE, type FileTemplateData } from "./types";
import type LiveTemplaterPlugin from "./main";

type ViewState = {
	activePath: string | null;
	keys: string[];
	fileData: FileTemplateData;
	canApplyToMarkdownView: boolean;
};

export class DataInputView extends ItemView {
	private root: Root | null = null;
	private state: ViewState = {
		activePath: null,
		keys: [],
		fileData: {
			values: {},
			applyToMarkdownView: false
		},
		canApplyToMarkdownView: false
	};

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: LiveTemplaterPlugin
	) {
		super(leaf);
	}

	getViewType() {
		return DATA_INPUT_VIEW_TYPE;
	}

	getDisplayText() {
		return "Live templater data";
	}

	getIcon() {
		return "braces";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		await this.refresh();
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
	}

	async refresh() {
		const file = this.app.workspace.getActiveFile();
		if (!(file instanceof TFile) || file.extension !== "md") {
			// The side pane is still usable, but it has no template source to inspect.
			this.state = {
				activePath: null,
				keys: [],
				fileData: {
					values: {},
					applyToMarkdownView: false
				},
				canApplyToMarkdownView: false
			};
			this.render();
			return;
		}

		const source = await this.app.vault.cachedRead(file);
		const fileData = this.plugin.getFileTemplateData(file.path);
		this.state = {
			activePath: file.path,
			keys: extractTemplateKeys(source),
			fileData,
			canApplyToMarkdownView: this.plugin.canReflectInMarkdownView(file.path)
		};
		this.render();
	}

	private render() {
		this.root?.render(
			<DataInputApp
				activePath={this.state.activePath}
				keys={this.state.keys}
				values={this.state.fileData.values}
				applyToMarkdownView={this.state.fileData.applyToMarkdownView}
				canApplyToMarkdownView={this.state.canApplyToMarkdownView}
				onValueChange={(key, value) => {
					void this.updateValue(key, value);
				}}
				onCopyToClipboard={() => {
					void this.copyToClipboard();
				}}
				onCopyToFile={() => {
					void this.openCopyToFileModal();
				}}
				onToggleApplyToMarkdownView={(enabled) => {
					void this.updateApplyToMarkdownView(enabled);
				}}
			/>
		);
	}

	private async updateValue(key: string, value: string) {
		const path = this.state.activePath;
		if (!path) return;

		// Persist by active file path so each note keeps its own template values.
		const values: TemplateFieldMap = {
			...this.state.fileData.values,
			[key]: value
		};
		this.state = {
			...this.state,
			fileData: {
				...this.state.fileData,
				values
			}
		};
		this.render();
		this.plugin.refreshMarkdownViews(path);
		await this.plugin.setFileTemplateValues(path, values);
	}

	private async updateApplyToMarkdownView(enabled: boolean) {
		const path = this.state.activePath;
		if (!path) return;
		if (enabled && !this.state.canApplyToMarkdownView) {
			// Obsidian exposes preview rerendering only for markdown reading views.
			new Notice("Reflect in view is available in reading mode only.");
			return;
		}

		await this.plugin.setFileApplyToMarkdownView(path, enabled);
		this.state = {
			...this.state,
			fileData: {
				...this.state.fileData,
				applyToMarkdownView: enabled
			}
		};
		this.render();
		this.plugin.refreshMarkdownViews(path);
	}

	private async copyToClipboard() {
		const rendered = await this.getRenderedActiveFile();
		if (rendered === null) return;

		await navigator.clipboard.writeText(rendered);
		new Notice("Copied rendered template to clipboard.");
	}

	private openCopyToFileModal() {
		new FileCopyModal(this.app, async (path) => {
			const rendered = await this.getRenderedActiveFile();
			if (rendered === null) return;

			await ensureParentFolder(this.app.vault, path);
			await this.app.vault.adapter.write(path, rendered);
			new Notice(`Copied rendered template to ${path}.`);
		}).open();
	}

	private async getRenderedActiveFile(): Promise<string | null> {
		const path = this.state.activePath;
		if (!path) return null;

		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) return null;

		const source = await this.app.vault.cachedRead(file);
		return renderTemplate(source, this.state.fileData.values);
	}
}

async function ensureParentFolder(vault: DataInputView["app"]["vault"], path: string) {
	const parts = path.split("/").slice(0, -1);
	let currentPath = "";

	// Create nested folders one segment at a time because the vault API is not mkdir -p.
	for (const part of parts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part;
		if (vault.getAbstractFileByPath(currentPath)) {
			continue;
		}

		await vault.createFolder(currentPath);
	}
}
