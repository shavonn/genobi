import type { AmendOperation, ConfigAPI, CreateAllOperation, CreateOperation, GeneratorConfig } from "../../src";
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

const AwwYeahHelper = (str: any) => {
	return `Aww, yeah! ${str}!`;
};

const MicDropHelper = (str: any) => {
	return `${str}! MIC DROP!!!`;
};

const makeCreateOperation: (overrides?: object) => CreateOperation = (overrides = {}) => ({
	type: "create",
	filePath: testFiles.component.filePath,
	templateFilePath: testFiles.component.templateFilePath,
	data: themeData,
	...overrides,
});

const makeCreateAllOperation: (overrides?: object) => CreateAllOperation = (overrides = {}) => ({
	type: "createAll",
	destinationPath: "src/components/{{kebabCase name}}",
	templateFileGlob: "templates/ui-kit-component/*.hbs",
	templateBasePath: "templates/ui-kit-component/",
	data: {
		theme: {
			name: "wavy",
			primary: "blue",
		},
	},
	...overrides,
});

const makeAmendOperation: (overrides?: object) => AmendOperation = (overrides = {}) =>
	({
		filePath: testFiles.aggregateCss.filePath,
		templateStr: testFiles.aggregateCss.templateStr,
		...overrides,
	}) as AmendOperation;

const component = {
	id: "react-component",
	generator: {
		description: "React component",
		prompts: [{ type: "input", name: "name", message: "What is the name of this component?" }],
		operations: [
			makeCreateOperation(),
			makeAmendOperation({ type: "append" }),
			makeAmendOperation({ type: "prepend" }),
		],
	} as GeneratorConfig,
	generatorNoOps: {
		description: "React component",
		prompts: [{ type: "input", name: "name", message: "What is the name of this component?" }],
	} as GeneratorConfig,
};

const fullConfigFunc = (genobi: ConfigAPI) => {
	genobi.setConfigFilePath(getTmpDirPath(configFilePath));
	genobi.setSelectionPrompt(selectionPrompt);
	genobi.addGenerator(component.id, component.generator);
	genobi.addHelper("awwYeah", AwwYeahHelper);
	genobi.addHelper("micDrop", MicDropHelper);
};

const slimConfigFunc = (genobi: ConfigAPI) => {
	genobi.setConfigFilePath(getTmpDirPath(configFilePath));
	genobi.setSelectionPrompt(selectionPrompt);
	genobi.addGenerator(component.id, component.generator);
	genobi.addHelper("awwYeah", AwwYeahHelper);
};

const zeroConfigFunc = (_: ConfigAPI) => {};

const testData = {
	configFilePath,
	selectionPrompt,
	themeData,
	component,
	AwwYeahHelper,
	makeAmendOperation,
	makeCreateOperation,
	makeCreateAllOperation,
	fullConfigFunc,
	slimConfigFunc,
	zeroConfigFunc,
};
export { testData };
