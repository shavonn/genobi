import { logger } from "../../src/utils/logger";
import { templates } from "../../src/utils/templates";

describe("template processor", () => {
	describe("processTemplate", () => {
		it("should process a template with Handlebars", () => {
			const template = "Hello, {{name}}!";
			const data = { name: "World" };

			const result = templates.process(template, data);

			expect(result).toBe("Hello, World!");
		});

		it("should handle conditional expressions", () => {
			const template = "{{#if condition}}True{{else}}False{{/if}}";
			const dataTrue = { condition: true };
			const dataFalse = { condition: false };

			expect(templates.process(template, dataTrue)).toBe("True");
			expect(templates.process(template, dataFalse)).toBe("False");
		});

		it("should handle nested properties", () => {
			const template = "{{user.profile.name}}";
			const data = { user: { profile: { name: "John" } } };

			const result = templates.process(template, data);

			expect(result).toBe("John");
		});

		it("should throw an error if the template or data are invalid", async () => {
			const template = "Hello {{#each items}}{{this}}{{/if}}";
			const data = { items: ["one", "two"] };

			expect(() => templates.process(template, data)).toThrowError(/Error processing template/);
			expect(logger.warn).toHaveBeenCalledTimes(2);
			expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error processing template"));
			expect(logger.warn).toHaveBeenCalledWith("Template:", template);
			expect(logger.warn).toHaveBeenCalledWith(
				"Data:",
				`{
  "items": [
    "one",
    "two"
  ]
}`,
			);
		});
	});
});
