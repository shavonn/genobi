import Handlebars from "handlebars";

const isString = (val: any): val is string => typeof val === "string";
const isNumber = (val: any): val is number => typeof val === "number";

export function camelCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.replace(/([-_.\s]+[a-zA-Z])/g, (g) => g.toUpperCase().replace(/[-_.\s]/g, ""))
		.replace(/^[A-Z]/, (c) => c.toLowerCase());
}

export function snakeCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.replace(/\s+/g, "_")
		.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
		.replace(/^_+/, "")
		.replace(/_+/g, "_")
		.toLowerCase();
}

export function kebabCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.replace(/\s+/g, "-")
		.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
		.replace(/^-+/, "")
		.replace(/-+/g, "-")
		.toLowerCase();
}

export function dotCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.replace(/\s+/g, ".")
		.replace(/[A-Z]/g, (letter) => `.${letter.toLowerCase()}`)
		.replace(/^\.+/, "")
		.replace(/\.+/g, ".")
		.toLowerCase();
}

export function pascalCase(str: any): string {
	if (!isString(str)) return "";
	return str.replace(/(^\w|[-_\s.]+(\w))/g, (_, p1, p2) => (p2 || p1).toUpperCase());
}

export function pathCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.replace(/\s+/g, "/")
		.replace(/[A-Z]/g, (letter) => `/${letter.toLowerCase()}`)
		.replace(/^\/+/, "")
		.replace(/\/+/g, "/")
		.toLowerCase();
}

export function lowerCase(str: any): string {
	if (!isString(str)) return "";
	return str.toLowerCase();
}

export function upperCase(str: any): string {
	if (!isString(str)) return "";
	return str.toUpperCase();
}

export function screamingSnakeCase(str: any): string {
	if (!isString(str)) return "";
	return snakeCase(str).toUpperCase();
}

export function sentenceCase(str: any): string {
	if (!isString(str)) return "";
	const result = str
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[_\-.]+/g, " ")
		.toLowerCase();
	return result.charAt(0).toUpperCase() + result.slice(1);
}

export function titleCase(str: any): string {
	if (!isString(str)) return "";
	return str
		.toLowerCase()
		.replace(/[_\-.]+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function truncate(str: any, limit: any, suffix: any = "..."): string {
	if (!isString(str) || !isNumber(limit) || !isString(suffix)) return "";
	return str.length <= limit ? str : str.slice(0, limit) + suffix;
}

export function truncateWords(str: any, wordLimit: any, suffix: any = "..."): string {
	if (!isString(str) || !isNumber(wordLimit) || !isString(suffix)) return "";
	const words = str.split(/\s+/);
	return words.length <= wordLimit ? str : words.slice(0, wordLimit).join(" ") + suffix;
}

export function ellipsis(str: any, limit: any): string {
	return truncate(str, limit);
}

export function append(str: any, toAppend: any): string {
	if (!isString(str) || !isString(toAppend)) return "";
	return str + toAppend;
}

export function prepend(str: any, toPrepend: any): string {
	if (!isString(str) || !isString(toPrepend)) return "";
	return toPrepend + str;
}

export function remove(str: any, toRemove: any): string {
	if (!isString(str) || !isString(toRemove)) return "";
	const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return str.replace(new RegExp(escaped, "g"), "");
}

export const stringHelpers = {
	camelCase,
	snakeCase,
	kebabCase,
	dotCase,
	pascalCase,
	pathCase,
	lowerCase,
	upperCase,
	screamingSnakeCase,
	sentenceCase,
	titleCase,
	truncate,
	truncateWords,
	ellipsis,
	append,
	prepend,
	remove,
};

export function registerStringHelpers() {
	for (const [name, fn] of Object.entries(stringHelpers)) {
		Handlebars.registerHelper(name, fn);
	}
}
