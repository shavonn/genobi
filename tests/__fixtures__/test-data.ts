import type { AmendOperation, ConfigAPI, CreateAllOperation, CreateOperation, GeneratorConfig } from "../../src";
import type { ForManyOperation } from "../../src/types/operation";
import { getTmpDirPath } from "../test-utils";
import { testFiles } from "./test-files";

const selectionPrompt: string = "Welcome to my totally awesome generator. Pick from the menu below:";

const configFilePath: string = "genobi.config.ts";

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
  templateFilesGlob: "templates/ui-kit-component/*.hbs",
  templateBasePath: "templates/ui-kit-component/",
  data: themeData,
  ...overrides,
});

const makeAmendOperation: (overrides?: object) => AmendOperation = (overrides = {}) =>
  ({
    filePath: testFiles.aggregateCss.filePath,
    templateStr: testFiles.aggregateCss.templateStr,
    ...overrides,
  }) as AmendOperation;

const makeForManyOperation: (overrides?: object) => ForManyOperation = (overrides = {}) => ({
  type: "forMany",
  generatorId: testData.component.id,
  items: [{ name: "button" }, { name: "card" }, { name: "modal" }],
  ...overrides,
});

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

const layout = {
  id: "next-layout",
  generator: {
    description: "Next layout",
    prompts: [{ type: "input", name: "path", message: "What dir? (relative from app)" }],
    operations: [
      makeCreateOperation({
        filePath: "src/app/{{path}}/layout.tsx",
        templateFile: "templates/Layout.tsx.hbs",
      }),
    ],
  } as GeneratorConfig,
};

const partialFunc = () => `<div class="bingo">{{name}}</div>`;

const fullConfigFunc = async (genobi: ConfigAPI) => {
  genobi.setConfigFilePath(getTmpDirPath(configFilePath));
  genobi.setSelectionPrompt(selectionPrompt);
  genobi.addGenerator(component.id, component.generator);
  genobi.addHelper("awwYeah", AwwYeahHelper);
  genobi.addHelper("micDrop", MicDropHelper);
  genobi.addPartial("importComponentCss", testFiles.aggregateCss.templateStr);
  genobi.addPartial("nameDiv", partialFunc);
  await genobi.addPartialFromFile("componentProps", testFiles.componentPropsPartial.filePath);
};

const slimConfigFunc = async (genobi: ConfigAPI) => {
  genobi.setConfigFilePath(getTmpDirPath(configFilePath));
  genobi.setSelectionPrompt(selectionPrompt);
  genobi.addGenerator(component.id, component.generator);
  genobi.addHelper("awwYeah", AwwYeahHelper);
  genobi.addPartial("importComponentCss", testFiles.aggregateCss.templateStr);
  await genobi.addPartialFromFile("componentProps", testFiles.componentPropsPartial.filePath);
};

const zeroConfigFunc = (_: ConfigAPI) => {};

const errConfigFunc = async (genobi: ConfigAPI) => {
  await genobi.addPartialFromFile("newPartials", "templates/partials/new-partial.hbs");
  genobi.addGenerator(component.id, component.generator);
};

const testData = {
  configFilePath,
  selectionPrompt,
  themeData,
  component,
  layout,
  AwwYeahHelper,
  MicDropHelper,
  makeAmendOperation,
  makeCreateOperation,
  makeCreateAllOperation,
  makeForManyOperation,
  fullConfigFunc,
  slimConfigFunc,
  zeroConfigFunc,
  errConfigFunc,
  partialFunc,
};
export { testData };
