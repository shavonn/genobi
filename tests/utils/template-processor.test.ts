import { logger } from "../../src/utils/logger";
import { templates } from "../../src/utils/templates";

describe("template processor", () => {
  beforeEach(() => {
    // Clear the cache before each test to ensure isolation
    templates.clearCache();
  });

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

  describe("template caching", () => {
    it("should cache compiled templates for reuse", () => {
      const template = "Hello, {{name}}!";

      // First call - should compile and cache
      templates.process(template, { name: "World" });
      expect(templates.getCacheSize()).toBe(1);

      // Second call with same template - should use cache
      templates.process(template, { name: "Universe" });
      expect(templates.getCacheSize()).toBe(1);

      // Different template - should add to cache
      templates.process("Goodbye, {{name}}!", { name: "World" });
      expect(templates.getCacheSize()).toBe(2);
    });

    it("should clear cache when clearCache is called", () => {
      templates.process("Template {{one}}", { one: 1 });
      templates.process("Template {{two}}", { two: 2 });
      expect(templates.getCacheSize()).toBe(2);

      templates.clearCache();
      expect(templates.getCacheSize()).toBe(0);
    });

    it("should produce correct results with cached templates", () => {
      const template = "{{greeting}}, {{name}}!";

      const result1 = templates.process(template, { greeting: "Hello", name: "Alice" });
      const result2 = templates.process(template, { greeting: "Hi", name: "Bob" });

      expect(result1).toBe("Hello, Alice!");
      expect(result2).toBe("Hi, Bob!");
      expect(templates.getCacheSize()).toBe(1);
    });
  });
});
