import { amendFile, append, prepend } from "./amend";
import { create } from "./create";
import { createAll } from "./create-all";
import { forMany } from "./for-many";

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

  /**
   * Runs a specified generator multiple times for variable data
   */
  forMany,
};

export { ops };
