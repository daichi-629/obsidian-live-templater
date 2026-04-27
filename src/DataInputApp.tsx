import { useEffect, useRef, useState, type ChangeEvent } from "react";
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
	const [draftValues, setDraftValues] = useState<TemplateFieldMap>(values);
	const composingKeysRef = useRef(new Set<string>());

	useEffect(() => {
		setDraftValues((currentValues) => {
			let changed = Object.keys(currentValues).length !== keys.length;
			const nextValues: TemplateFieldMap = {};

			for (const key of keys) {
				const value = composingKeysRef.current.has(key)
					? (currentValues[key] ?? values[key] ?? "")
					: (values[key] ?? "");
				nextValues[key] = value;
				changed ||= currentValues[key] !== value;
			}

			return changed ? nextValues : currentValues;
		});
	}, [keys, values]);

	const updateDraftValue = (key: string, value: string) => {
		setDraftValues((currentValues) => {
			if (currentValues[key] === value) {
				return currentValues;
			}

			return {
				...currentValues,
				[key]: value
			};
		});
	};

	const handleValueChange = (key: string, event: ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.currentTarget.value;
		updateDraftValue(key, value);

		if (!composingKeysRef.current.has(key) && !isCompositionInputEvent(event)) {
			onValueChange(key, value);
		}
	};

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
							value={draftValues[key] ?? ""}
							rows={2}
							onChange={(event) => handleValueChange(key, event)}
							onCompositionStart={() => {
								composingKeysRef.current.add(key);
							}}
							onCompositionEnd={(event) => {
								composingKeysRef.current.delete(key);
								const value = event.currentTarget.value;
								updateDraftValue(key, value);
								onValueChange(key, value);
							}}
						/>
					</label>
				))}
			</form>
		</div>
	);
}

function isCompositionInputEvent(event: ChangeEvent<HTMLTextAreaElement>): boolean {
	return "isComposing" in event.nativeEvent && event.nativeEvent.isComposing === true;
}
