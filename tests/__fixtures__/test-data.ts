import type { ConfigAPI, CreateOperation, GeneratorConfig } from "../../src";
import { getTmpDirPath } from "../test-utils";

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
	filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
	templateFilePath: "templates/component.tsx.hbs",
	data: themeData,
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
	makeCreateOperation,
	fullConfigFunc,
	slimConfigFunc,
	zeroConfigFunc,
};
export { testData };
