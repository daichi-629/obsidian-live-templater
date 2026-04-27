import type { TemplateFieldMap } from "./template";

type DataInputAppProps = {
	activePath: string | null;
	keys: string[];
	values: TemplateFieldMap;
	applyToMarkdownView: boolean;
	canApplyToMarkdownView: boolean;
	onValueChange: (key: string, value: string) => void;
	onCopyToClipboard: () => void;
	onCopyToFile: () => void;
	onToggleApplyToMarkdownView: (enabled: boolean) => void;
};

export function DataInputApp({
	activePath,
	keys,
	values,
	applyToMarkdownView,
	canApplyToMarkdownView,
	onValueChange,
	onCopyToClipboard,
	onCopyToFile,
	onToggleApplyToMarkdownView
}: DataInputAppProps) {
	return (
		<div className="live-templater-view">
			<header className="live-templater-header">
				<div>
					<h2>Data input</h2>
					<p>{activePath ?? "Open a markdown file to edit template data."}</p>
				</div>
				<label className="live-templater-toggle">
					<input
						type="checkbox"
						checked={applyToMarkdownView}
						disabled={!activePath || !canApplyToMarkdownView}
						onChange={(event) => onToggleApplyToMarkdownView(event.currentTarget.checked)}
					/>
					<span>Reflect in view</span>
				</label>
			</header>

			<div className="live-templater-actions">
				<button type="button" disabled={!activePath} onClick={onCopyToClipboard}>
					Copy to clipboard
				</button>
				<button type="button" disabled={!activePath} onClick={onCopyToFile}>
					Copy to file
				</button>
			</div>

			{activePath && keys.length === 0 ? (
				<p className="live-templater-empty">No template keys found in the active file.</p>
			) : null}

			<form className="live-templater-form">
				{keys.map((key) => (
					<label className="live-templater-field" key={key}>
						<span>{key}</span>
						<textarea
							value={values[key] ?? ""}
							rows={2}
							onChange={(event) => onValueChange(key, event.currentTarget.value)}
						/>
					</label>
				))}
			</form>
		</div>
	);
}
