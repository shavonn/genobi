# Genobi

<p style="text-align:center;">
    <img src="https://img.shields.io/npm/v/genobi" alt="npm version">
    <img alt="GitHub Actions Release Workflow Status" src="https://img.shields.io/github/actions/workflow/status/shavonn/genobi/release.yml?label=Build">
    <img alt="GitHub Actions Test Workflow Status" src="https://img.shields.io/github/actions/workflow/status/shavonn/genobi/test.yml?label=Test">
    <img src="https://img.shields.io/npm/l/genobi" alt="license">
</p>

> Help me Obi-Wan Genobi, you're our only hope.

Genobi is a flexible, customizable file generator and modifier tool designed to streamline your development workflow. It
allows you to generate and modify text files through templates, prompts, and operations configured to your specific
needs.

***

## Why Genobi?

I like to work smarter. I like tools that make my life easier. I started out
using [plopjs](https://github.com/plopjs/plop), but then, I wanted to do more and differently.

To put it simply, sometimes, I _am_ a Burger King, and I like to have it my way.

***

<!-- TOC -->
* [Genobi](#genobi)
  * [Why Genobi?](#why-genobi)
  * [Requirements](#requirements)
  * [Installation](#installation)
    * [Install Genobi globally:](#install-genobi-globally)
      * [Why would I install Genobi globally?](#why-would-i-install-genobi-globally)
    * [Install  as a dev dependency in your project:](#install--as-a-dev-dependency-in-your-project)
  * [Usage](#usage)
    * [Create a Config File](#create-a-config-file)
    * [Run Genobi](#run-genobi)
      * [Args](#args)
      * [Options](#options)
  * [Configuration](#configuration)
    * [Config API](#config-api)
  * [Generators](#generators)
  * [Operations](#operations)
    * [Create Operation](#create-operation)
    * [CreateAll Operation](#createall-operation)
    * [ForMany Operation](#formany-operation)
    * [Append Operation](#append-operation)
    * [Prepend Operation](#prepend-operation)
    * [Custom Operation](#custom-operation)
    * [Registered Operations](#registered-operations)
  * [Custom Helpers](#custom-helpers)
  * [Built-in Handlebars Helpers](#built-in-handlebars-helpers)
    * [Basic String Transformers](#basic-string-transformers)
    * [String Helpers with Additional Args](#string-helpers-with-additional-args)
  * [Examples](#examples)
    * [Full React Component Generator](#full-react-component-generator)
    * [Using Template Files](#using-template-files)
    * [Using Partials for Shared Templates](#using-partials-for-shared-templates)
    * [Batch Generation with ForMany](#batch-generation-with-formany)
    * [API Route Generator with Validation](#api-route-generator-with-validation)
    * [Monorepo Package Generator with CreateAll](#monorepo-package-generator-with-createall)
  * [Things to Know](#things-to-know)
    * [Templates and Prompts](#templates-and-prompts)
    * [Template File Size](#template-file-size)
  * [License](#license)
<!-- TOC -->

## Requirements

- Node.js >= 20.12.0

## Installation

### Install Genobi globally:

```bash
npm install -g genobi
```

#### Why would I install Genobi globally?

When you run Genobi, it will look in the current directory for the Genobi config file, and if it doesn't find it there,
it will traverse up through parent directories to find one. That means that you can store your Genobi config and
templates outside of your project and use them in any other project.

### Install  as a dev dependency in your project:

```bash
npm install -D genobi
```

## Usage

### Create a Config File

Create a `genobi.config.js` file in the root of your project. The extension can be any of: `js`, `ts`, `mjs`, or `cjs`.

### Run Genobi

```bash
pnpm genobi [generator] [options]

genobi [generator] [options] // global
```

#### Args

- `generator`: Optional ID of the generator to use

```bash
genobi react-component
```

#### Options

- `-d, --destination <path>`: Root directory for generating files (relative paths will resolve from here)
- `-v, --verbose`: Progress information logs
- `--debug`: Technical detail logs

## Configuration

This file exports a function that receives the Genobi API as its parameter:

### Config API

The Genobi API provides the following methods:

| Method                   | Parameters                                             | Return Type                                   | Description                                                  |
|--------------------------|--------------------------------------------------------|-----------------------------------------------|--------------------------------------------------------------|
| `setConfigFilePath`      | `(configFilePath: string)`                             | `void`                                        | Sets the path to the config file                             |
| `getConfigFilePath`      | `()`                                                   | `string`                                      | Returns the current config file path                         |
| `setDestinationBasePath` | `(destinationDirPath: string)`                         | `void`                                        | Sets the base directory for generating files                 |
| `getDestinationBasePath` | `()`                                                   | `string`                                      | Returns the base directory for generating files              |
| `setSelectionPrompt`     | `(message: string)`                                    | `void`                                        | Sets the prompt message displayed during generator selection |
| `getSelectionPrompt`     | `()`                                                   | `string`                                      | Returns the current prompt message                           |
| `addGenerator`           | `(id: string, config: GeneratorConfig)`                | `void`                                        | Adds a new generator to the configuration                    |
| `getGenerator`           | `(generatorId: string)`                                | `GeneratorConfig`                             | Returns a specific generator by ID                           |
| `getGenerators`          | `()`                                                   | `Record<string, GeneratorConfig>`             | Returns all registered generators                            |
| `addHelper`*             | `(name: string, helper: HelperDelegate)`               | `void`                                        | Adds a custom Handlebars helper                              |
| `getHelper`              | `(name: string)`                                       | `HelperDelegate`                              | Returns a specific helper by name                            |
| `getHelpers`             | `()`                                                   | `Record<string, HelperDelegate>`              | Returns all registered helpers                               |
| `addPartial`*            | `(name: string, partial: Template\| TemplateDelegate)` | `void`                                        | Adds a custom Handlebars template partial                    |
| `addPartialFromFile`     | `(name: string, partialFilePath:string)`               | `void`                                        | Adds a custom Handlebars template partial from file          |
| `getPartial`             | `(name: string)`                                       | `Template\| TemplateDelegate`                 | Returns a specific partial by name                           |
| `getPartials`            | `()`                                                   | `Record<string, Template\| TemplateDelegate>` | Returns all registered partials                              |
| `addOperation`           | `(name: string, handler: CustomOperationHandler)`      | `void`                                        | Registers a reusable custom operation                        |
| `getOperation`           | `(name: string)`                                       | `CustomOperationHandler \| undefined`         | Returns a registered operation by name                       |
| `getOperations`          | `()`                                                   | `Record<string, CustomOperationHandler>`      | Returns all registered operations                            |

> **Note**: Handlebars helpers and partials docs can be found on [their website](https://handlebarsjs.com/).

```javascript
// genobi.config.js
export default (genobi) => {
    genobi.setDestinationBasePath("src/")
    genobi.addGenerator("react-component", {
        description: "React component",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "What is the name of this component?"
            }
        ],
        operations: [
            {
                type: "create",
                filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
                templateStr: `export function {{pascalCase name}}() {
                    return (
                        <div className="{{kebabCase name}}" />
                    );
                }`
            },
            {
                type: "append",
                filePath: "src/css/components.css",
                templateStr: `@import "../components/{{kebabCase name}}/{{kebabCase name}}.css";`
            }
        ]
    });
};
```

## Generators

Generators are defined with the following structure:

| Property      | Type                 | Description                                                                       | Required |
|---------------|----------------------|-----------------------------------------------------------------------------------|----------|
| `description` | `string`             | Human-readable description of the generator                                       | Yes      |
| `prompts`     | `DistinctQuestion[]` | Array of [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) question objects | No       |
| `operations`  | `Operation[]`        | Array of operations to perform                                                    | Yes      |

Example:

```javascript
const reactGenerator = {
    description: "React component",
    prompts: [
        {
            type: "input",
            name: "name",
            message: "Component name?",
            default: "Button"
        }
    ],
    operations: [
        // Create component file
        {
            type: "create",
            filePath: "src/components/{{kebabCase name}}.tsx",
            templateStr: `export const {{pascalCase name}} = () => {\n  return <div>{{name}}</div>;\n};\n`
        }
    ]
}
```

## Operations

Genobi supports several operation types:

### Create Operation

Creates a new file.

| Property           | Type                     | Description                                   | Default    |
|--------------------|--------------------------|-----------------------------------------------|------------|
| `type`             | `string`                 | Must be `"create"`                            | *required* |
| `filePath`         | `string`                 | Handlebars template for output file path      | *required* |
| `templateStr`      | `string`                 | Handlebars template string for file content   | -          |
| `templateFilePath` | `string`                 | Path to a Handlebars template file            | -          |
| `skipIfExists`     | `boolean`                | Skip operation if file exists                 | `false`    |
| `overwrite`        | `boolean`                | Overwrite file if it exists                   | `false`    |
| `data`             | `Record<string, any>`    | Additional data for templates                 | `{}`       |
| `skip`             | `(data: any) => boolean` | Function to determine if op should be skipped | -          |
| `haltOnError`      | `boolean`                | Whether to stop execution on error            | `true`     |

> **Note**: Either `templateStr` or `templateFilePath` must be provided.

### CreateAll Operation

Creates multiple files matching a glob pattern.

| Property            | Type                     | Description                                               | Default    |
|---------------------|--------------------------|-----------------------------------------------------------|------------|
| `type`              | `string`                 | Must be `"createAll"`                                     | *required* |
| `destinationPath`   | `string`                 | Handlebars template for destination directory             | *required* |
| `templateFilesGlob` | `string`                 | Glob pattern to match template files                      | *required* |
| `templateBasePath`  | `string`                 | Section of template path to exclude when generating files | -          |
| `data`              | `Record<string, any>`    | Additional data for templates                             | `{}`       |
| `skipIfExists`      | `boolean`                | Skip if file already exists                               | `false`    |
| `overwrite`         | `boolean`                | Overwrite files if they exist                             | `false`    |
| `skip`              | `(data: any) => boolean` | Function to determine if op should be skipped             | -          |
| `haltOnError`       | `boolean`                | Whether to stop execution on error                        | `true`     |
| `verbose`           | `boolean`                | Log each time a file is created                           | `true`     |

### ForMany Operation

Runs a generator multiple times with different inputs.

| Property        | Type                                                                 | Description                                       | Default                                                 |
|-----------------|----------------------------------------------------------------------|---------------------------------------------------|---------------------------------------------------------|
| `type`          | `string`                                                             | Must be `"forMany"`                               | *required*                                              |
| `generatorId`   | `string`                                                             | ID of the generator to run multiple times         | *required*                                              |
| `items`         | `any[]                                                               | ((data: Record<string, any>) => any[])`           | Array of data objects or function that returns an array | *required* |
| `transformItem` | `(item: any, index: number, parentData: Record<string, any>) => any` | Function to transform each item before processing | -                                                       |
| `data`          | `Record<string, any>`                                                | Additional data for templates                     | `{}`                                                    |
| `skip`          | `(data: any) => boolean`                                             | Function to determine if op should be skipped     | -                                                       |
| `haltOnError`   | `boolean`                                                            | Whether to stop execution on error                | `true`                                                  |

Example:

```javascript
const forManyOperation = {
    type: "forMany",
    generatorId: "react-component",
    items: (data) => {
        return data.componentTypes.map(component => ({
            name: component
        }));
    }
}
```

### Append Operation

Appends content to an existing file.

| Property           | Type                     | Description                                              | Default    |
|--------------------|--------------------------|----------------------------------------------------------|------------|
| `type`             | `string`                 | `"append"`                                               | *required* |
| `filePath`         | `string`                 | Path to the file to append to                            | *required* |
| `templateStr`      | `string`                 | Handlebars template string for content to append         | -          |
| `templateFilePath` | `string`                 | Path to a Handlebars template file for content to append | -          |
| `pattern`          | `string \| RegExp`       | Pattern to find where to append content                  | -          |
| `separator`        | `string`                 | String to insert between existing and new content        | `"\n"`     |
| `unique`           | `boolean`                | Skip if content already exists in file                   | `true`     |
| `data`             | `Record<string, any>`    | Additional data for templates                            | `{}`       |
| `skip`             | `(data: any) => boolean` | Function to determine if op should be skipped            | -          |
| `haltOnError`      | `boolean`                | Whether to stop execution on error                       | `true`     |

> **Note**: Either `templateStr` or `templateFilePath` must be provided.

### Prepend Operation

Prepends content to an existing file.

| Property           | Type                     | Description                                               | Default    |
|--------------------|--------------------------|-----------------------------------------------------------|------------|
| `type`             | `string`                 | `"prepend"`                                               | *required* |
| `filePath`         | `string`                 | Path to the file to prepend to                            | *required* |
| `templateStr`      | `string`                 | Handlebars template string for content to prepend         | -          |
| `templateFilePath` | `string`                 | Path to a Handlebars template file for content to prepend | -          |
| `pattern`          | `string \| RegExp`       | Pattern to find where to prepend content                  | -          |
| `separator`        | `string`                 | String to insert between new and existing content         | `"\n"`     |
| `unique`           | `boolean`                | Skip if content already exists in file                    | `true`     |
| `data`             | `Record<string, any>`    | Additional data for templates                             | `{}`       |
| `skip`             | `(data: any) => boolean` | Function to determine if op should be skipped             | -          |
| `haltOnError`      | `boolean`                | Whether to stop execution on error                        | `true`     |

> **Note**: Either `templateStr` or `templateFilePath` must be provided.

### Custom Operation

Executes a custom inline function for one-off operations that don't fit the built-in types.

| Property      | Type                                                       | Description                                   | Default    |
|---------------|------------------------------------------------------------|-----------------------------------------------|------------|
| `type`        | `string`                                                   | Must be `"custom"`                            | *required* |
| `name`        | `string`                                                   | Name for logging/error messages               | *required* |
| `action`      | `(data: TemplateData, context: OperationContext) => void`  | Function to execute                           | *required* |
| `data`        | `Record<string, any>`                                      | Additional data passed to action              | `{}`       |
| `skip`        | `(data: any) => boolean`                                   | Function to determine if op should be skipped | -          |
| `haltOnError` | `boolean`                                                  | Whether to stop execution on error            | `true`     |

The `action` function receives two parameters:
- `data`: Combined data from prompts and operation data
- `context`: An object with utilities:
  - `destinationPath`: Absolute path to the destination base directory
  - `configPath`: Absolute path to the config file directory
  - `logger`: Logger with `info`, `warn`, `error`, `debug`, and `success` methods
  - `replaceInFile(filePath, pattern, replacement)`: Replace content in a file

Example:

```javascript
{
    type: "custom",
    name: "add-timestamp",
    action: async (data, context) => {
        await context.replaceInFile(
            `src/${data.name}.tsx`,
            "// TIMESTAMP",
            `// Created: ${new Date().toISOString()}`
        );
        context.logger.info("Timestamp added!");
    }
}
```

### Registered Operations

For reusable custom operations, register them with `addOperation` and reference by name:

```javascript
import { promisify } from "node:util";
import { execFile as execFileCallback } from "node:child_process";
import path from "node:path";

const execFile = promisify(execFileCallback);

export default (genobi) => {
    // Register a reusable operation
    genobi.addOperation("format-files", async (data, context) => {
        const targetPath = path.join(context.destinationPath, data.name, "**/*");
        await execFile("prettier", ["--write", targetPath]);
    });

    genobi.addGenerator("component", {
        description: "React component with formatting",
        prompts: [{ type: "input", name: "name", message: "Component name?" }],
        operations: [
            {
                type: "create",
                filePath: "src/{{name}}.tsx",
                templateStr: "export const {{name}} = () => <div />;"
            },
            // Use the registered operation by name as the type
            { type: "format-files" }
        ]
    });
};
```

> **Note**: Registered operation names cannot use reserved names: `create`, `createAll`, `append`, `prepend`, `forMany`, `custom`.

> **Security**: When executing shell commands in custom operations, use `execFile` with argument arrays instead of `exec` with string interpolation. Never pass untrusted input directly into shell command strings, as this can enable command injection attacks.

## Custom Helpers

You can add your own Handlebars helpers:

```javascript
export default (genobi) => {
    genobi.addHelper("awesomize", (str) => {
        return `${str} is awesome!`;
    });
}
```

## Built-in Handlebars Helpers

Genobi includes several helpful string transformation helpers:

### Basic String Transformers

- `camelCase`: Converts string to camelCase
- `snakeCase`: Converts string to snake_case
- `kebabCase` (alias: `dashCase`): Converts string to kebab-case
- `dotCase`: Converts string to dot.case
- `pascalCase` (alias: `properCase`): Converts string to PascalCase
- `pathCase`: Converts string to path/case
- `screamingSnakeCase` (alias: `constantCase`): Converts string to SCREAMING_SNAKE_CASE
- `sentenceCase`: Converts string to Sentence case
- `titleCase`: Converts string to Title Case
- `lowerCase`: Converts string to lowercase
- `upperCase`: Converts string to UPPERCASE

### String Helpers with Additional Args

| Helper          | Arguments                  | Description                                                                     | Example                                                              |
|-----------------|----------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `truncate`      | `(str, limit, suffix)`     | Trims string to a maximum length with optional suffix (default: "...")          | `{{truncate "Hello world" 5}}` → "Hello..."                          |
| `truncateWords` | `(str, wordLimit, suffix)` | Trims string to a maximum number of words with optional suffix (default: "...") | `{{truncateWords "Hello beautiful world" 2}}` → "Hello beautiful..." |
| `ellipsis`      | `(str, limit)`             | Adds an ellipsis to limited text                                                | `{{ellipsis "Hello world" 5}}` → "Hello..."                          |
| `append`        | `(str, toAppend)`          | Appends a string to another                                                     | `{{append "Hello" " world"}}` → "Hello world"                        |
| `prepend`       | `(str, toPrepend)`         | Prepends a string to another                                                    | `{{prepend "world" "Hello "}}` → "Hello world"                       |
| `remove`        | `(str, toRemove)`          | Removes all occurrences of substring                                            | `{{remove "Hello world" "o"}}` → "Hell wrld"                         |

## Examples

### Full React Component Generator

A complete generator that creates a component with styles, tests, and a Storybook story:

```javascript
export default (genobi) => {
    genobi.addGenerator("react-component", {
        description: "React component with styles, tests, and story",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Component name?",
                validate: (input) => input.length > 0 || "Name is required"
            },
            {
                type: "list",
                name: "styling",
                message: "Styling approach?",
                choices: ["css", "scss", "styled-components", "none"]
            },
            {
                type: "confirm",
                name: "withTest",
                message: "Include test file?",
                default: true
            },
            {
                type: "confirm",
                name: "withStory",
                message: "Include Storybook story?",
                default: false
            }
        ],
        operations: [
            // Component file
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
                templateStr: `import React from "react";
{{#if (eq styling "css")}}import "./{{pascalCase name}}.css";{{/if}}
{{#if (eq styling "scss")}}import "./{{pascalCase name}}.scss";{{/if}}

export interface {{pascalCase name}}Props {
  children?: React.ReactNode;
}

export const {{pascalCase name}}: React.FC<{{pascalCase name}}Props> = ({ children }) => {
  return (
    <div className="{{kebabCase name}}">
      {children}
    </div>
  );
};
`
            },
            // CSS file (conditional)
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.css",
                templateStr: `.{{kebabCase name}} {\n  /* styles */\n}\n`,
                skip: (data) => data.styling !== "css"
            },
            // SCSS file (conditional)
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.scss",
                templateStr: `.{{kebabCase name}} {\n  /* styles */\n}\n`,
                skip: (data) => data.styling !== "scss"
            },
            // Test file (conditional)
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx",
                templateStr: `import { render, screen } from "@testing-library/react";
import { {{pascalCase name}} } from "./{{pascalCase name}}";

describe("{{pascalCase name}}", () => {
  it("renders children", () => {
    render(<{{pascalCase name}}>Hello</{{pascalCase name}}>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
`,
                skip: (data) => !data.withTest
            },
            // Story file (conditional)
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.stories.tsx",
                templateStr: `import type { Meta, StoryObj } from "@storybook/react";
import { {{pascalCase name}} } from "./{{pascalCase name}}";

const meta: Meta<typeof {{pascalCase name}}> = {
  title: "Components/{{pascalCase name}}",
  component: {{pascalCase name}},
};

export default meta;
type Story = StoryObj<typeof {{pascalCase name}}>;

export const Default: Story = {
  args: {
    children: "{{pascalCase name}} content",
  },
};
`,
                skip: (data) => !data.withStory
            },
            // Index barrel export
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/index.ts",
                templateStr: `export { {{pascalCase name}} } from "./{{pascalCase name}}";\nexport type { {{pascalCase name}}Props } from "./{{pascalCase name}}";\n`
            },
            // Add to components index
            {
                type: "append",
                filePath: "src/components/index.ts",
                templateStr: `export * from "./{{pascalCase name}}";`,
                unique: true
            }
        ]
    });
};
```

### Using Template Files

For larger templates, use external files instead of inline strings:

```
project/
├── genobi.config.js
└── templates/
    └── component/
        ├── component.tsx.hbs
        ├── component.test.tsx.hbs
        └── component.css.hbs
```

```javascript
// genobi.config.js
export default (genobi) => {
    genobi.addGenerator("component", {
        description: "Component from template files",
        prompts: [
            { type: "input", name: "name", message: "Component name?" }
        ],
        operations: [
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
                templateFilePath: "templates/component/component.tsx.hbs"
            },
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx",
                templateFilePath: "templates/component/component.test.tsx.hbs"
            },
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.css",
                templateFilePath: "templates/component/component.css.hbs"
            }
        ]
    });
};
```

### Using Partials for Shared Templates

Register partials for reusable template snippets:

```javascript
export default (genobi) => {
    // Register a partial for file headers
    genobi.addPartial("fileHeader", `/**
 * {{name}}
 * Generated by Genobi on {{timestamp}}
 */
`);

    genobi.addGenerator("service", {
        description: "Service class",
        prompts: [
            { type: "input", name: "name", message: "Service name?" }
        ],
        operations: [
            {
                type: "create",
                filePath: "src/services/{{pascalCase name}}Service.ts",
                templateStr: `{{> fileHeader}}
export class {{pascalCase name}}Service {
  // Implementation
}
`,
                data: {
                    timestamp: new Date().toISOString()
                }
            }
        ]
    });
};
```

### Batch Generation with ForMany

Generate multiple files from a list:

```javascript
export default (genobi) => {
    // Simple component generator (used by forMany)
    genobi.addGenerator("simple-component", {
        description: "Simple component",
        operations: [
            {
                type: "create",
                filePath: "src/components/{{pascalCase name}}.tsx",
                templateStr: `export const {{pascalCase name}} = () => <div>{{pascalCase name}}</div>;\n`,
                skipIfExists: true
            }
        ]
    });

    // Batch generator
    genobi.addGenerator("component-batch", {
        description: "Generate multiple components",
        prompts: [
            {
                type: "input",
                name: "components",
                message: "Component names (comma-separated)?",
                filter: (input) => input.split(",").map(s => s.trim())
            }
        ],
        operations: [
            {
                type: "forMany",
                generatorId: "simple-component",
                items: (data) => data.components,
                transformItem: (name) => ({ name })
            }
        ]
    });
};
```

### API Route Generator with Validation

```javascript
export default (genobi) => {
    genobi.addGenerator("api-route", {
        description: "Express API route",
        prompts: [
            {
                type: "input",
                name: "resource",
                message: "Resource name (singular)?",
                validate: (input) => /^[a-z]+$/.test(input) || "Use lowercase letters only"
            },
            {
                type: "checkbox",
                name: "methods",
                message: "HTTP methods to include?",
                choices: [
                    { name: "GET (list)", value: "list", checked: true },
                    { name: "GET (single)", value: "get", checked: true },
                    { name: "POST", value: "post", checked: true },
                    { name: "PUT", value: "put", checked: true },
                    { name: "DELETE", value: "delete", checked: true }
                ]
            }
        ],
        operations: [
            {
                type: "create",
                filePath: "src/routes/{{resource}}.routes.ts",
                templateStr: `import { Router } from "express";
import * as controller from "../controllers/{{resource}}.controller";

const router = Router();

{{#each methods}}
{{#if (eq this "list")}}router.get("/{{../resource}}s", controller.list);{{/if}}
{{#if (eq this "get")}}router.get("/{{../resource}}s/:id", controller.get);{{/if}}
{{#if (eq this "post")}}router.post("/{{../resource}}s", controller.create);{{/if}}
{{#if (eq this "put")}}router.put("/{{../resource}}s/:id", controller.update);{{/if}}
{{#if (eq this "delete")}}router.delete("/{{../resource}}s/:id", controller.remove);{{/if}}
{{/each}}

export default router;
`
            },
            {
                type: "create",
                filePath: "src/controllers/{{resource}}.controller.ts",
                templateStr: `import { Request, Response } from "express";

{{#each methods}}
{{#if (eq this "list")}}
export const list = async (req: Request, res: Response) => {
  // List all {{../resource}}s
};
{{/if}}
{{#if (eq this "get")}}
export const get = async (req: Request, res: Response) => {
  // Get single {{../resource}}
};
{{/if}}
{{#if (eq this "post")}}
export const create = async (req: Request, res: Response) => {
  // Create {{../resource}}
};
{{/if}}
{{#if (eq this "put")}}
export const update = async (req: Request, res: Response) => {
  // Update {{../resource}}
};
{{/if}}
{{#if (eq this "delete")}}
export const remove = async (req: Request, res: Response) => {
  // Delete {{../resource}}
};
{{/if}}
{{/each}}
`
            },
            {
                type: "append",
                filePath: "src/routes/index.ts",
                templateStr: `import {{resource}}Routes from "./{{resource}}.routes";\napp.use({{resource}}Routes);`,
                pattern: "// ROUTES",
                unique: true
            }
        ]
    });
};
```

### Monorepo Package Generator with CreateAll

```javascript
export default (genobi) => {
    genobi.addGenerator("package", {
        description: "New monorepo package",
        prompts: [
            { type: "input", name: "name", message: "Package name?" },
            { type: "input", name: "description", message: "Description?" }
        ],
        operations: [
            // Copy all template files maintaining structure
            {
                type: "createAll",
                destinationPath: "packages/{{kebabCase name}}",
                templateFilesGlob: "templates/package/**/*",
                templateBasePath: "templates/package"
            },
            // Add to workspace
            {
                type: "append",
                filePath: "pnpm-workspace.yaml",
                templateStr: `  - "packages/{{kebabCase name}}"`,
                unique: true
            }
        ]
    });
};
```

## Things to Know

### Templates and Prompts

Genobi uses [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for prompts
and [Handlebars](https://handlebarsjs.com/) for templates.

### Template File Size

I would avoid template files over 50MB. I started working on a streaming option, but it got rocky when considering
control flow logic, loops, and the prepend operation. So, instead, I started to work on extending Handlebars template
parsing to chunk with logic and loop boundaries but that will take a little time wrap up with higher priority things on
my plate.

## License

MPL-2.0 (Mozilla Public License 2.0)