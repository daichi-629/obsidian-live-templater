import { App, Modal, Notice, Setting, normalizePath } from "obsidian";

export class FileCopyModal extends Modal {
	private filePath = "";

	constructor(
		app: App,
		private readonly onSubmit: (path: string) => Promise<void>
	) {
		super(app);
	}

	onOpen() {
		this.titleEl.setText("Copy rendered template to file");

		new Setting(this.contentEl)
			.setName("File path")
			.setDesc("Path inside this vault.")
			.addText((text) => {
				text.setPlaceholder("folder/output.md")
					.setValue(this.filePath)
					.onChange((value) => {
						this.filePath = value;
					});
				text.inputEl.addEventListener("keydown", (event) => {
					if (event.key === "Enter") {
						void this.submit();
					}
				});
			});

		new Setting(this.contentEl).addButton((button) => {
			button.setButtonText("Copy to file").setCta().onClick(() => {
				void this.submit();
			});
		});
	}

	onClose() {
		this.contentEl.empty();
	}

	private async submit() {
		const path = normalizeCopyPath(this.filePath);
		if (!path) {
			return;
		}

		await this.onSubmit(path);
		this.close();
	}
}

function normalizeCopyPath(input: string): string | null {
	const path = normalizePath(input.trim());
	if (!path) {
		return null;
	}

	const fileName = path.split("/").pop() ?? "";
	const extensionIndex = fileName.lastIndexOf(".");
	if (extensionIndex <= 0) {
		return `${path}.md`;
	}

	const extension = fileName.slice(extensionIndex + 1).toLowerCase();
	if (extension !== "md") {
		new Notice("Copy to file only supports Markdown files. Use a .md extension.");
		return null;
	}

	return path;
}
