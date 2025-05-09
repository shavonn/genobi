import Handlebars from "handlebars";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { includedHelpers } from "./helpers/included-helpers";
import { logger } from "./logger";

/**
 * Registers all helpers defined in the configuration.
 * This makes custom helpers available in Handlebars templates.
 */
function registerConfiguredHelpers() {
	for (const [name, helper] of store.state().helpers) {
		Handlebars.registerHelper(name, helper);
	}
}

/**
 * Registers all template partials defined in the configuration.
 * This makes custom partials available in Handlebars templates.
 */
function registerConfiguredPartials() {
	for (const [name, partial] of store.state().partials) {
		Handlebars.registerPartial(name, partial);
	}
}

/**
 * Processes a template string with Handlebars, using the provided data.
 *
 * @param {string} template - The Handlebars template string
 * @param {Record<string, any>} data - The data to use for template processing
 * @returns {string} The processed template output
 * @throws {GenobiError} If template processing fails
 */
export function processTemplate(template: string, data: Record<string, any>): string {
	try {
		const compiledTemplate = Handlebars.compile(template);
		return compiledTemplate(data);
	} catch (err: any) {
		logger.error(`Error processing template: ${err.message}`);
		logger.warn("Template:", template);
		logger.warn("Data:", JSON.stringify(data, null, 2));
		throw new GenobiError("TEMPLATE_PROCESSING_ERROR", `Error processing template: ${err.message}`, err);
	}
}

/**
 * Utility for working with Handlebars templates.
 */
const templates = {
	/**
	 * Processes a template string with Handlebars.
	 *
	 * @param {string} template - The Handlebars template string
	 * @param {Record<string, any>} data - The data to use for template processing
	 * @returns {string} The processed template output
	 */
	process: processTemplate,

	/**
	 * Registers all helpers and partials to make them available in templates.
	 * This should be called before processing any templates.
	 */
	registerComponents: () => {
		includedHelpers.register();
		registerConfiguredHelpers();
		registerConfiguredPartials();
	},
};
export { templates };
