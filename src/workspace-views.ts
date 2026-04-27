import { App, MarkdownView, Notice } from "obsidian";
import { DataInputView } from "./data-input-view";
import { DATA_INPUT_VIEW_TYPE } from "./types";

type RerenderableMarkdownView = MarkdownView & {
	previewMode?: {
		rerender?: (force?: boolean) => void;
	};
	currentMode?: {
		rerender?: (force?: boolean) => void;
	};
};

type ModeReadableMarkdownView = MarkdownView & {
	getMode?: () => string;
};

export async function activateDataInputView(app: App) {
	const existingLeaf = app.workspace.getLeavesOfType(DATA_INPUT_VIEW_TYPE)[0];
	if (existingLeaf) {
		await app.workspace.revealLeaf(existingLeaf);
		await refreshDataInputViews(app);
		return;
	}

	const leaf = app.workspace.getRightLeaf(false);
	if (!leaf) {
		new Notice("Could not open data input view.");
		return;
	}

	await leaf.setViewState({
		type: DATA_INPUT_VIEW_TYPE,
		active: true
	});
	await app.workspace.revealLeaf(leaf);
}

export async function refreshDataInputViews(app: App) {
	const leaves = app.workspace.getLeavesOfType(DATA_INPUT_VIEW_TYPE);
	await Promise.all(
		leaves.map(async (leaf) => {
			if (leaf.view instanceof DataInputView) {
				await leaf.view.refresh();
			}
		})
	);
}

export function canReflectInMarkdownView(app: App, path: string): boolean {
	for (const leaf of app.workspace.getLeavesOfType("markdown")) {
		const view = leaf.view;
		if (view instanceof MarkdownView && view.file?.path === path) {
			const modeReadable = view as ModeReadableMarkdownView;
			if (modeReadable.getMode?.() === "preview") {
				return true;
			}
		}
	}

	return false;
}

export function refreshMarkdownViews(app: App, path: string) {
	for (const leaf of app.workspace.getLeavesOfType("markdown")) {
		const view = leaf.view;
		if (!(view instanceof MarkdownView) || view.file?.path !== path) {
			continue;
		}

		const rerenderable = view as RerenderableMarkdownView;
		rerenderable.previewMode?.rerender?.(true);
		rerenderable.currentMode?.rerender?.(true);
	}
}
