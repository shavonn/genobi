import { loadTestFiles } from "../test-utils";

const component = {
  filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
  templateFilePath: "templates/component.tsx.hbs",
  templateFileContent: `export function {{pascalCase name}}(props) {
    return (
        <div {...props} className="{{kebabCase theme.name}}-{{kebabCase name}}" />
    );
}`,
};

const componentCss = {
  filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.css",
  templateStr: `.{{kebabCase name}} {
    text-color: "text-white",
    background-color: {{theme.primary}};
}`,
};

const aggregateCss = {
  existing: `@import "../components/header/header.css";\n@import "../components/table/table.css";\n@import "../components/switch/switch.css";\n@import "../components/radio/radio.css";`,
  filePath: "src/css/components.css",
  templateStr: `@import "../components/{{kebabCase name}}/{{kebabCase name}}.css";`,
};

const componentPropsPartial = {
  filePath: "templates/partials/component-props.hbs",
  template: `export type {{pascalcase name}}Props = {
    className?: string;
};`,
};

const loadExistingFiles = async () => {
  await loadTestFiles({
    "templates/component.tsx.hbs": component.templateFileContent,
    "templates/partials/component-props.hbs": componentPropsPartial.template,
    "templates/ui-kit-component/{{kebabCase name}}.tsx.hbs": component.templateFileContent,
    "templates/ui-kit-component/{{kebabCase name}}.css.hbs": componentCss.templateStr,
    "src/css/components.css": aggregateCss.existing,
  });
};

const testFiles = {
  component,
  componentCss,
  componentPropsPartial,
  aggregateCss,
  loadExistingFiles,
};
export { testFiles };
