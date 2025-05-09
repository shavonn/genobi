import Handlebars from "handlebars";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { includedHelpersRegister } from "./helpers/included-helpers-register";
import { logger } from "./logger";

function registerConfiguredHelpers() {
	for (const [name, helper] of store.state().helpers) {
		Handlebars.registerHelper(name, helper);
	}
}

function registerConfiguredPartials() {
	for (const [name, partial] of store.state().partials) {
		Handlebars.registerPartial(name, partial);
	}
}

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

const templates = {
	process: processTemplate,
	registerComponents: () => {
		includedHelpersRegister.register();
		registerConfiguredHelpers();
		registerConfiguredPartials();
	},
};
export { templates };
