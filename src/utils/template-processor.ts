import Handlebars from "handlebars";
import { logger } from "./logger";

export function processTemplate(template: string, data: Record<string, any>): string {
	try {
		const compiledTemplate = Handlebars.compile(template);
		return compiledTemplate(data);
	} catch (error: any) {
		logger.error(`Error processing template: ${error.message}`);
		logger.warn("Template:", template);
		logger.warn("Data:", JSON.stringify(data, null, 2));
		throw new Error(`Error processing template: ${error.message}`);
	}
}

const templateProcessor = {
	process: processTemplate,
};
export { templateProcessor };
