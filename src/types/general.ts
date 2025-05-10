/**
 * Represents a selectable choice for interactive prompts.
 * Used for generator selection and other choice-based prompts.
 */
export interface SelectChoice {
	/**
	 * Display name shown to the user in the selection menu.
	 */
	name: string;

	/**
	 * Value returned when this choice is selected.
	 */
	value: string;
}

/**
 * Union of all possible error names in the application.
 * Used to categorize errors and provide consistent error handling.
 */
export type ErrorName =
	/** Configuration load errors */
	| "CONFIG_LOAD_ERROR"
	/** When a generator has no operations */
	| "MISSING_OPERATIONS_ERROR"
	/** When a specified generator is not found */
	| "GENERATOR_NOT_FOUND"
	/** When a specified helper is not found */
	| "HELPER_NOT_FOUND"
	/** When an unknown operation type is encountered */
	| "UNKNOWN_OPERATION_TYPE"
	/** When no template is found for an operation */
	| "NO_TEMPLATE_FOUND"
	/** When reading a file fails */
	| "READ_ERROR"
	/** When writing a file fails */
	| "WRITE_ERROR"
	/** When a file already exists and can't be overwritten */
	| "FILE_EXISTS"
	/** When processing a template fails */
	| "TEMPLATE_PROCESSING_ERROR"
	/** When no files match a glob pattern */
	| "NO_GLOB_MATCHES"
	/** When a specified partial is not found */
	| "PARTIAL_NOT_FOUND"
	/** When creating a directory fails */
	| "MKDIR_DIR_ERROR"
	/** Invalid or empty array given for forMany operation */
	| "INVALID_FOR_MANY_ITEMS";
