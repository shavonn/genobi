import type { ConfigAPI } from "../../src";
import type { GeneratorConfig } from "../../src/types/generator";
import type { CreateOperation } from "../../src/types/operation";
import { getTmpDirPath } from "../test-utils";

const selectionPrompt: string = "Welcome to my totally awesome generator. Pick from the menu below:";

const configFilePath: string = "genobi.config.js";

const makeCreateOperation: (overrides?: object) => CreateOperation = (overrides = {}) => ({
	type: "create",
	filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
	templateFilePath: "templates/component.tsx.hbs",
	data: {
		theme: {
			name: "wavy",
			primary: "blue",
		},
	},
	...overrides,
});

const component = {
	id: "react-component",
	generator: {
		description: "React component",
		prompts: [{ type: "input", name: "name", message: "What is the name of this component?" }],
		operations: [makeCreateOperation()],
	} as GeneratorConfig,
};

const fullConfigFunc = (genobi: ConfigAPI) => {
	genobi.setConfigPath(getTmpDirPath(configFilePath));
	genobi.setSelectionPrompt(selectionPrompt);
	genobi.addGenerator(component.id, component.generator);
};

const zeroConfigFunc = (_: ConfigAPI) => {};

const testData = {
	configFilePath,
	selectionPrompt,
	component,
	makeCreateOperation,
	fullConfigFunc,
	zeroConfigFunc,
};
export { testData };
