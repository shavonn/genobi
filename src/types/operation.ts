/**
 * Type alias for template data passed to Handlebars templates.
 * Uses `unknown` to indicate the values need type narrowing when accessed.
 */
export type TemplateData = Record<string, unknown>;

/**
 * Union type representing all possible operation types.
 * Note: BaseOperation is excluded to maintain a proper discriminated union.
 */
export type Operation = AmendOperation | CreateOperation | CreateAllOperation | ForManyOperation | CustomOperation;

/**
 * Base interface for all operations.
 * Defines common properties available to every operation type.
 */
export interface BaseOperation {
	/**
	 * The type of operation to perform.
	 */
	type: string;

	/**
	 * Additional data to merge with user input for template processing.
	 * This data will be available to templates along with prompt answers.
	 */
	data?: TemplateData;

	/**
	 * Optional function that determines if this operation should be skipped.
	 * If the function returns true, the operation will be skipped.
	 *
	 * @param {TemplateData} data - The merged data from prompts and operation data
	 * @returns {boolean | Promise<boolean>} True if the operation should be skipped
	 */
	skip?: (data?: TemplateData) => boolean | Promise<boolean>;

	/**
	 * Whether to stop execution if this operation fails.
	 * If true, an error in this operation will prevent subsequent operations from running.
	 * If false, execution will continue with the next operation.
	 *
	 * @default true
	 */
	haltOnError?: boolean;
}

/**
 * Common interface for operations that work with a single file.
 * Used by create, append, and prepend operations.
 */
export interface SingleFileOperation extends BaseOperation {
	/**
	 * The path to the file to operate on.
	 * Can include Handlebars templates that will be processed with the data.
	 *
	 * @example "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx"
	 */
	filePath: string;

	/**
	 * The template string to use for the operation.
	 * Either templateStr or templateFilePath must be provided.
	 */
	templateStr?: string;

	/**
	 * The path to a template file to use for the operation.
	 * Either templateStr or templateFilePath must be provided.
	 */
	templateFilePath?: string;
}

/**
 * Interface for operations that modify existing files by appending or prepending content.
 */
export interface AmendOperation extends SingleFileOperation {
	/**
	 * The type of amendment operation: "append" or "prepend".
	 */
	type: "append" | "prepend";

	/**
	 * String to insert between existing content and new content.
	 *
	 * @default "\\n"
	 */
	separator?: string;

	/**
	 * Whether to skip if the content already exists in the file.
	 *
	 * @default true
	 */
	unique?: boolean;

	/**
	 * Optional pattern to find where to append/prepend content.
	 * If provided, the operation will insert content at the matched position.
	 * If not provided or not found, append will add to the end and prepend to the beginning.
	 */
	pattern?: string | RegExp;
}

/**
 * Interface for append operations, which add content to the end of a file.
 */
export interface AppendOperation extends AmendOperation {
	/**
	 * The type of the operation, always "append".
	 */
	type: "append";
}

/**
 * Interface for prepend operations, which add content to the beginning of a file.
 */
export interface PrependOperation extends AmendOperation {
	/**
	 * The type of the operation, always "prepend".
	 */
	type: "prepend";
}

/**
 * Interface for create operations, which create new files.
 */
export interface CreateOperation extends SingleFileOperation {
	/**
	 * The type of the operation, always "create".
	 */
	type: "create";

	/**
	 * Whether to skip this operation if the target file already exists.
	 *
	 * @default false
	 */
	skipIfExists?: boolean;

	/**
	 * Whether to overwrite the file if it already exists.
	 *
	 * @default false
	 */
	overwrite?: boolean;
}

/**
 * Interface for createAll operations, which create multiple files from a glob pattern.
 * This is useful for creating entire directory structures from templates.
 */
export interface CreateAllOperation extends BaseOperation {
	/**
	 * The type of the operation, always "createAll".
	 */
	type: "createAll";

	/**
	 * The destination path where files will be created.
	 * Can include Handlebars templates that will be processed with the data.
	 *
	 * @example "src/components/{{kebabCase name}}"
	 */
	destinationPath: string;

	/**
	 * Glob pattern to match template files.
	 * Can include Handlebars templates that will be processed with the data.
	 *
	 * @example "templates/component/*.hbs"
	 */
	templateFilesGlob: string;

	/**
	 * Base path for templates. This part of the path will be excluded when
	 * creating the destination file paths.
	 */
	templateBasePath?: string;

	/**
	 * Whether to log each file creation.
	 *
	 * @default true
	 */
	verbose?: boolean;

	/**
	 * Whether to skip creating files that already exist.
	 *
	 * @default false
	 */
	skipIfExists?: boolean;

	/**
	 * Whether to overwrite files if they already exist.
	 *
	 * @default false
	 */
	overwrite?: boolean;
}

/**
 * Interface for forMany operations, which run a generator multiple times with different data.
 * This allows for efficient creation of multiple components in a single operation.
 */
export interface ForManyOperation extends BaseOperation {
	/**
	 * The type of the operation, always "forMany".
	 */
	type: "forMany";

	/**
	 * The ID of the generator to run multiple times.
	 * This generator must be defined in the configuration.
	 */
	generatorId: string;

	/**
	 * The array of data objects to use for each generator run.
	 * Each item in the array will be passed to the generator as input data.
	 * This can be a static array or a function that returns an array.
	 */
	items: unknown[] | ((data: TemplateData) => unknown[]);

	/**
	 * Optional function to transform each item before passing to the generator.
	 * This can be used to format or augment the data for each run.
	 *
	 * @param {unknown} item - The current item from the items array
	 * @param {number} index - The index of the current item
	 * @param {TemplateData} parentData - The parent data object
	 * @returns {TemplateData} The transformed data to pass to the generator
	 */
	transformItem?: (item: unknown, index: number, parentData: TemplateData) => TemplateData;
}

/**
 * Context object passed to custom operation handlers.
 * Provides utilities and information about the current execution context.
 */
export interface OperationContext {
	/**
	 * Absolute path to the destination base directory for generated files.
	 */
	destinationPath: string;

	/**
	 * Absolute path to the directory containing the config file.
	 */
	configPath: string;

	/**
	 * Logger instance for outputting messages.
	 */
	logger: {
		info: (message: string) => void;
		warn: (message: string) => void;
		error: (message: string, details?: string) => void;
		debug: (message: string) => void;
		success: (message: string) => void;
	};

	/**
	 * Utility function to replace content in a file.
	 *
	 * @param {string} filePath - Path to the file (relative to destination)
	 * @param {string | RegExp} pattern - Pattern to match
	 * @param {string} replacement - Replacement string
	 * @returns {Promise<void>}
	 */
	replaceInFile: (filePath: string, pattern: string | RegExp, replacement: string) => Promise<void>;
}

/**
 * Handler function signature for custom operations.
 * Can return void or a Promise for async operations.
 *
 * @param {TemplateData} data - The merged data from prompts and operation data
 * @param {OperationContext} context - Context object with utilities
 * @returns {void | Promise<void>}
 */
export type CustomOperationHandler = (data: TemplateData, context: OperationContext) => void | Promise<void>;

/**
 * Interface for custom operations with inline action functions.
 * Use this for one-off operations that don't need to be reused.
 */
export interface CustomOperation extends BaseOperation {
	/**
	 * The type of the operation, always "custom".
	 */
	type: "custom";

	/**
	 * A descriptive name for this operation, used in logging and error messages.
	 */
	name: string;

	/**
	 * The action function to execute.
	 * Receives the merged data and a context object with utilities.
	 */
	action: CustomOperationHandler;
}
