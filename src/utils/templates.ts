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
 * Processes a template string with Handlebars, using the provided data.
 *
 * @param {string} template - The Handlebars template string
 * @param {Record<string, any>} data - The data to use for template processing
 * @returns {string} The processed template output
 * @throws {GenobiError} If template processing fails
 */
export function processTemplate(template: string, data: Record<string, any>): string {
	logger.debug("Processing template with Handlebars");
	logger.debug(`Template length: ${template.length} characters`);

	try {
		logger.debug("Compiling template");
		const compiledTemplate = Handlebars.compile(template);

		logger.debug("Executing template with data");
		const result = compiledTemplate(data);

		logger.debug(`Template processed successfully, result length: ${result.length} characters`);
		return result;
	} catch (err: any) {
		logger.error(`Error processing template: ${err.message}`);
		logger.warn("Template:", template);
		logger.warn("Data:", JSON.stringify(data, null, 2));
		logger.debug(`Error details: ${err.stack || "No stack trace available"}`);

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
		logger.info("Registering template components");
		includedHelpers.register();
		registerConfiguredHelpers();
		registerConfiguredPartials();
		logger.debug("Template components registration complete");
	},
};
export { templates };
