export interface GenobiConfigAPI {
	setConfigPath(path: string): void;
	getConfigPath(): string;
	getDestinationBasePath(): string;
	setSelectionPrompt(prompt: string): void;
	getSelectionPrompt(): string;
}
