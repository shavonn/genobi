import type { DistinctQuestion } from "inquirer";
import type { Operation } from "./operation";

export interface GeneratorConfig {
	description: string;
	prompts: DistinctQuestion[];
	operations: Operation[];
}
