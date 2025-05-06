export interface GenobiConfigAPI {
	setConfigPath(path: string): void;
	getConfigPath(): string;
	getDestinationBasePath(): string;
}
