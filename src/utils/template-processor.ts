import Handlebars from "handlebars";
import { GenobiError } from "../errors";
import { logger } from "./logger";

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

const templateProcessor = {
	process: processTemplate,
};
export { templateProcessor };
