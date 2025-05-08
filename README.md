# genobi

<p style="text-align:center;">
    <img src="https://img.shields.io/npm/v/genobi" alt="npm version">
    <img alt="GitHub Actions Release Workflow Status" src="https://img.shields.io/github/actions/workflow/status/shavonn/genobi/release.yml?label=Build">
    <img alt="GitHub Actions Test Workflow Status" src="https://img.shields.io/github/actions/workflow/status/shavonn/genobi/test.yml?label=Test">
    <img src="https://img.shields.io/npm/l/genobi" alt="license">
</p>

> Help me Obi-Wan genobi, you're our only hope.

genobi is a flexible, customizable file generator and modifier tool designed to streamline your development workflow. It
allows you to generate and modify text files through templates, prompts, and operations configured to your specific
needs.

## Why genobi?

I like to work smarter. I like tools that make my life easier. I started out
using [plopjs](https://github.com/plopjs/plop), but then, I wanted to do more and differently.

To put it simply, sometimes, I _am_ a Burger King, and I like to have it my way.

## Installation

Install genobi globally:

```bash
npm install -g genobi
```

Or as a dev dependency in your project:

```bash
npm install -D genobi
```

## Usage

genobi is configured via a `genobi.config.js` file in the root of your project. This file exports a function that
receives the genobi API as its parameter:

```javascript
// genobi.config.js
export default (genobi) => {
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

Then, run the CLI:

```bash
genobi
```

Or with a specific generator:

```bash
genobi react-component
```

## Configuration

### Config File

Create a `genobi.config.js` file in the root of your project. The extension can be any of: `js`, `ts`, `mjs`, or `cjs`.

### Config API

The genobi API provides the following methods:

| Method                   | Parameters                               | Return Type                       | Description                                                  |
|--------------------------|------------------------------------------|-----------------------------------|--------------------------------------------------------------|
| `setSelectionPrompt`     | `(message: string)`                      | `void`                            | Sets the prompt message displayed during generator selection |
| `getSelectionPrompt`     | `()`                                     | `string`                          | Returns the current prompt message                           |
| `addGenerator`           | `(id: string, config: GeneratorConfig)`  | `void`                            | Adds a new generator to the configuration                    |
| `getGenerator`           | `(generatorId: string)`                  | `GeneratorConfig`                 | Returns a specific generator by ID                           |
| `getGenerators`          | `()`                                     | `Record<string, GeneratorConfig>` | Returns all registered generators                            |
| `addHelper`              | `(name: string, helper: HelperDelegate)` | `void`                            | Adds a custom Handlebars helper                              |
| `getHelper`              | `(name: string)`                         | `HelperDelegate`                  | Returns a specific helper by name                            |
| `getHelpers`             | `()`                                     | `Record<string, HelperDelegate>`  | Returns all registered helpers                               |
| `setConfigFilePath`      | `(configFilePath: string)`               | `void`                            | Sets the path to the config file                             |
| `getConfigFilePath`      | `()`                                     | `string`                          | Returns the current config file path                         |
| `getDestinationBasePath` | `()`                                     | `string`                          | Returns the base directory for generating files              |

### CLI Options

```
genobi [generator] [options]
```

- `generator`: Optional ID of the generator to use
- `-d, --destination <path>`: Root directory for generating files (relative paths will resolve from here)
- `-v, --verbose`: Log all operations as they are completed

## Generators

Generators are defined with the following structure:

| Property      | Type                 | Description                                                                       | Required |
|---------------|----------------------|-----------------------------------------------------------------------------------|----------|
| `description` | `string`             | Human-readable description of the generator                                       | Yes      |
| `prompts`     | `DistinctQuestion[]` | Array of [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) question objects | No       |
| `operations`  | `Operation[]`        | Array of operations to perform                                                    | Yes      |

Example:

```javascript
{
    description: "React component",
        prompts:[
        {
            type: "input",
            name: "name",
            message: "Component name?",
            default: "Button"
        }
    ], 
    operations:[
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

genobi supports several operation types:

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

genobi includes several helpful string transformation helpers:

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

## License

MPL-2.0 (Mozilla Public License 2.0)