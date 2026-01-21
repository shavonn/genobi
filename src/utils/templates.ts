import type { TemplateDelegate } from "handlebars";
import Handlebars from "handlebars";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { common } from "./common";
import { includedHelpers } from "./helpers/included-helpers";
import { logger } from "./logger";

/**
 * Cache for compiled Handlebars templates.
 * Keys are template strings, values are compiled template functions.
 * This avoids recompiling the same template multiple times.
 */
const templateCache = new Map<string, TemplateDelegate>();

/**
 * Maximum number of templates to cache.
 * Prevents unbounded memory growth for applications processing many unique templates.
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Registers all helpers defined in the configuration.
 * This makes custom helpers available in Handlebars templates.
 */
function registerConfiguredHelpers() {
	logger.debug("Registering configured helpers");
	const helpersCount = store.state().helpers.size;
	logger.debug(`Found ${helpersCount} helpers to register`);

	if (helpersCount > 0) {
		for (const [name, helper] of store.state().helpers) {
			logger.debug(`Registering helper: ${name}`);
			Handlebars.registerHelper(name, helper);
		}
		logger.debug("All helpers registered successfully");
	} else {
		logger.debug("No custom helpers found to register");
	}
}

/**
 * Registers all template partials defined in the configuration.
 * This makes custom partials available in Handlebars templates.
 */
function registerConfiguredPartials() {
	logger.debug("Registering configured partials");
	const partialsCount = store.state().partials.size;
	logger.debug(`Found ${partialsCount} partials to register`);

	if (partialsCount > 0) {
		for (const [name, partial] of store.state().partials) {
			logger.debug(`Registering partial: ${name}`);
			Handlebars.registerPartial(name, partial);
		}
		logger.debug("All partials registered successfully");
	} else {
		logger.debug("No custom partials found to register");
	}
}

/**
 * Gets a compiled template from cache, or compiles and caches it if not found.
 *
 * @param {string} template - The Handlebars template string
 * @returns {TemplateDelegate} The compiled template function
 */
function getCompiledTemplate(template: string): TemplateDelegate {
	let compiled = templateCache.get(template);

	if (!compiled) {
		logger.debug("Template not in cache, compiling");

		// Prevent unbounded cache growth by clearing if too large
		if (templateCache.size >= MAX_CACHE_SIZE) {
			logger.debug(`Template cache reached max size (${MAX_CACHE_SIZE}), clearing oldest entries`);
			// Clear the oldest half of the cache (simple LRU approximation)
			const entriesToRemove = Math.floor(MAX_CACHE_SIZE / 2);
			const keys = Array.from(templateCache.keys()).slice(0, entriesToRemove);
			for (const key of keys) {
				templateCache.delete(key);
			}
		}

		compiled = Handlebars.compile(template);
		templateCache.set(template, compiled);
	} else {
		logger.debug("Using cached compiled template");
	}

	return compiled;
}

/**
 * Clears the template cache.
 * Useful when helpers or partials are re-registered and templates need to be recompiled.
 */
function clearTemplateCache(): void {
	const size = templateCache.size;
	templateCache.clear();
	logger.debug(`Cleared template cache (${size} entries)`);
}

/**
 * Returns the current size of the template cache.
 *
 * @returns {number} The number of cached templates
 */
function getTemplateCacheSize(): number {
	return templateCache.size;
}

/**
 * Processes a template string with Handlebars, using the provided data.
 * Compiled templates are cached to avoid recompilation on repeated use.
 *
 * @param {string} template - The Handlebars template string
 * @param {Record<string, unknown>} data - The data to use for template processing
 * @returns {string} The processed template output
 * @throws {GenobiError} If template processing fails
 */
export function processTemplate(template: string, data: Record<string, unknown>): string {
	logger.debug("Processing template with Handlebars");
	logger.debug(`Template length: ${template.length} characters`);

	try {
		const compiledTemplate = getCompiledTemplate(template);

		logger.debug("Executing template with data");
		const result = compiledTemplate(data);

		logger.debug(`Template processed successfully, result length: ${result.length} characters`);
		return result;
	} catch (err) {
		const message = common.getErrorMessage(err);
		logger.error(`Error processing template: ${message}`);
		logger.warn("Template:", template);
		logger.warn("Data:", JSON.stringify(data, null, 2));
		logger.debug(`Error details: ${common.isErrorWithStack(err) ? err.stack : "No stack trace available"}`);

		throw new GenobiError("TEMPLATE_PROCESSING_ERROR", `Error processing template: ${message}`, err);
	}
}

/**
 * Utility for working with Handlebars templates.
 */
const templates = {
	/**
	 * Processes a template string with Handlebars.
	 * Compiled templates are cached for performance.
	 *
	 * @param {string} template - The Handlebars template string
	 * @param {Record<string, unknown>} data - The data to use for template processing
	 * @returns {string} The processed template output
	 */
	process: processTemplate,

	/**
	 * Registers all helpers and partials to make them available in templates.
	 * This should be called before processing any templates.
	 * Also clears the template cache to ensure templates are recompiled with new helpers/partials.
	 */
	registerComponents: () => {
		logger.info("Registering template components");
		// Clear cache when re-registering components to ensure templates use new helpers/partials
		clearTemplateCache();
		includedHelpers.register();
		registerConfiguredHelpers();
		registerConfiguredPartials();
		logger.debug("Template components registration complete");
	},

	/**
	 * Clears the compiled template cache.
	 * Useful when helpers or partials change and templates need to be recompiled.
	 */
	clearCache: clearTemplateCache,

	/**
	 * Returns the current size of the template cache.
	 *
	 * @returns {number} The number of cached templates
	 */
	getCacheSize: getTemplateCacheSize,
};
export { templates };
