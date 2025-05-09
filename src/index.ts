import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type { DistinctQuestion } from "inquirer";
import type { ConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";
import type {
	AmendOperation,
	AppendOperation,
	CreateAllOperation,
	CreateOperation,
	Operation,
	PrependOperation,
} from "./types/operation";

export type {
	ConfigAPI,
	HelperDelegate,
	Template,
	TemplateDelegate,
	DistinctQuestion,
	GeneratorConfig,
	Operation,
	AmendOperation,
	AppendOperation,
	CreateOperation,
	CreateAllOperation,
	PrependOperation,
};
