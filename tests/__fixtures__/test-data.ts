import type { AmendOperation, ConfigAPI, CreateOperation, GeneratorConfig } from "../../src";
import { getTmpDirPath } from "../test-utils";
import { testFiles } from "./test-files";

const selectionPrompt: string = "Welcome to my totally awesome generator. Pick from the menu below:";

const configFilePath: string = "genobi.config.js";

const themeData = {
	theme: {
		name: "denim",
		primary: "denim-600",
	},
};

const makeCreateOperation: (overrides?: object) => CreateOperation = (overrides = {}) => ({
	type: "create",
	filePath: testFiles.css.filePath,
	templateFilePath: testFiles.component.templateFilePath,
	data: themeData,
	...overrides,
});

const makeAmendOperation: (overrides?: object) => Partial<AmendOperation> = (overrides = {}) => ({
	filePath: testFiles.css.filePath,
	templateStr: testFiles.css.templateStr,
	...overrides,
});

const component = {
	id: "react-component",
	generator: {
		description: "React component",
		prompts: [{ type: "input", name: "name", message: "What is the name of this component?" }],
		operations: [makeCreateOperation()],
	} as GeneratorConfig,
	generatorNoOps: {
		description: "React component",
		prompts: [{ type: "input", name: "name", message: "What is the name of this component?" }],
	} as GeneratorConfig,
};

const fullConfigFunc = (genobi: ConfigAPI) => {
	genobi.setConfigPath(getTmpDirPath(configFilePath));
	genobi.setSelectionPrompt(selectionPrompt);
	genobi.addGenerator(component.id, component.generator);
};

const slimConfigFunc = (genobi: ConfigAPI) => {
	genobi.setConfigPath(getTmpDirPath(configFilePath));
	genobi.setSelectionPrompt(selectionPrompt);
	genobi.addGenerator(component.id, component.generator);
};

const zeroConfigFunc = (_: ConfigAPI) => {};

const testData = {
	configFilePath,
	selectionPrompt,
	themeData,
	component,
	makeAmendOperation,
	makeCreateOperation,
	fullConfigFunc,
	slimConfigFunc,
	zeroConfigFunc,
};
export { testData };
