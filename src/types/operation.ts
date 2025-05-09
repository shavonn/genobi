export type Operation = AmendOperation | CreateOperation | CreateAllOperation;

export interface BaseOperation {
	type: string;
	data?: Record<string, any>;
	skip?: (data?: any) => boolean | Promise<boolean>;
	haltOnError?: boolean;
}

export interface SingleFileOperation extends BaseOperation {
	filePath: string;
	templateStr?: string;
	templateFilePath?: string;
}

export interface AmendOperation extends SingleFileOperation {
	type: "append" | "prepend";
	separator?: string;
	unique?: boolean;
	pattern?: string | RegExp;
}

export interface AppendOperation extends AmendOperation {
	type: "append";
}

export interface PrependOperation extends AmendOperation {
	type: "prepend";
}

export interface CreateOperation extends SingleFileOperation {
	type: "create";
	skipIfExists?: boolean;
	overwrite?: boolean;
}

export interface CreateAllOperation extends BaseOperation {
	type: "createAll";
	destinationPath: string;
	templateFilesGlob: string;
	templateBasePath?: string;
	verbose?: boolean;
	skipIfExists?: boolean;
	overwrite?: boolean;
}
