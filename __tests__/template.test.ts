import { describe, expect, it } from "vitest";
import { extractTemplateKeys, parseTemplate, renderTemplate } from "../src/template";

describe("parseTemplate", () => {
	it("returns placeholder tokens with positions", () => {
		expect(parseTemplate("Hello {{name}} from {{ city }}")).toEqual([
			{
				type: "placeholder",
				key: "name",
				raw: "{{name}}",
				start: 6,
				end: 14
			},
			{
				type: "placeholder",
				key: "city",
				raw: "{{ city }}",
				start: 20,
				end: 30
			}
		]);
	});
});

describe("extractTemplateKeys", () => {
	it("returns sorted unique keys", () => {
		expect(extractTemplateKeys("{{name}} {{date}} {{name}}")).toEqual(["date", "name"]);
	});
});

describe("renderTemplate", () => {
	it("replaces known placeholders and leaves unknown placeholders untouched", () => {
		expect(renderTemplate("Hello {{name}} from {{city}}", { name: "Obsidian" })).toBe(
			"Hello Obsidian from {{city}}"
		);
	});
});
