import type { Question } from "inquirer";
import type { Operation } from "./operation";

/**
 * Configuration for a Genobi generator.
 * Each generator consists of a description, optional prompts for user input,
 * and a set of operations to perform.
 */
export interface GeneratorConfig {
	/**
	 * Human-readable description of the generator.
	 * This is displayed in the selection menu when choosing a generator.
	 */
	description: string;

	/**
	 * Array of Inquirer.js question objects that prompt the user for input.
	 * The answers will be available to operations as template data.
	 *
	 * @see {@link https://github.com/SBoudrias/Inquirer.js#questions} for question format
	 */
	prompts: Question[];

	/**
	 * Array of operations to perform when the generator is executed.
	 * Operations include creating files, appending/prepending to files, etc.
	 */
	operations: Operation[];
}
