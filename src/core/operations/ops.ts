import { amendFile, append, prepend } from "./amend";
import { create } from "./create";
import { createAll } from "./create-all";

/**
 * Collection of operation implementations.
 * These functions handle the actual execution of different operation types.
 */
const ops = {
	/**
	 * Executes a generic amend operation (append or prepend)
	 */
	amendFile,

	/**
	 * Appends content to a file
	 */
	append,

	/**
	 * Creates a new file
	 */
	create,

	/**
	 * Creates multiple files from a template pattern
	 */
	createAll,

	/**
	 * Prepends content to a file
	 */
	prepend,
};

export { ops };
