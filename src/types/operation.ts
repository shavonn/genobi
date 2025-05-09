/**
 * Union type representing all possible operation types.
 */
export type Operation = AmendOperation | CreateOperation | CreateAllOperation;

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
	data?: Record<string, any>;

	/**
	 * Optional function that determines if this operation should be skipped.
	 * If the function returns true, the operation will be skipped.
	 *
	 * @param {any} data - The merged data from prompts and operation data
	 * @returns {boolean | Promise<boolean>} True if the operation should be skipped
	 */
	skip?: (data?: any) => boolean | Promise<boolean>;

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
