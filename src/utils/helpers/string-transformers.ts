import Handlebars from "handlebars";

/**
 * Type guard to check if a value is a string
 *
 * @param {any} val - The value to check
 * @returns {boolean} True if the value is a string
 */
const isString = (val: unknown): val is string => typeof val === "string";

/**
 * Type guard to check if a value is a number
 *
 * @param {any} val - The value to check
 * @returns {boolean} True if the value is a number
 */
const isNumber = (val: unknown): val is number => typeof val === "number";

/**
 * Converts a string to camelCase format.
 *
 * @example
 * camelCase("hello world") => "helloWorld"
 * camelCase("foo-bar") => "fooBar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The camelCase string or empty string if input is not a string
 */
export function camelCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .replace(/([-_.\s]+[a-zA-Z])/g, (g) => g.toUpperCase().replace(/[-_.\s]/g, ""))
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/**
 * Converts a string to snake_case format.
 *
 * @example
 * snakeCase("hello world") => "hello_world"
 * snakeCase("fooBar") => "foo_bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The snake_case string or empty string if input is not a string
 */
export function snakeCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .replace(/\s+/g, "_")
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_+/, "")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * Converts a string to kebab-case format.
 *
 * @example
 * kebabCase("hello world") => "hello-world"
 * kebabCase("fooBar") => "foo-bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The kebab-case string or empty string if input is not a string
 */
export function kebabCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .replace(/\s+/g, "-")
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace(/^-+/, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * Converts a string to dot.case format.
 *
 * @example
 * dotCase("hello world") => "hello.world"
 * dotCase("fooBar") => "foo.bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The dot.case string or empty string if input is not a string
 */
export function dotCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .replace(/\s+/g, ".")
    .replace(/[A-Z]/g, (letter) => `.${letter.toLowerCase()}`)
    .replace(/^\.+/, "")
    .replace(/\.+/g, ".")
    .toLowerCase();
}

/**
 * Converts a string to PascalCase format.
 *
 * @example
 * pascalCase("hello world") => "HelloWorld"
 * pascalCase("foo-bar") => "FooBar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The PascalCase string or empty string if input is not a string
 */
export function pascalCase(str: unknown): string {
  if (!isString(str)) return "";
  return str.replace(/(^\w|[-_\s.]+(\w))/g, (_, p1, p2) => (p2 || p1).toUpperCase());
}

/**
 * Converts a string to path/case format.
 *
 * @example
 * pathCase("hello world") => "hello/world"
 * pathCase("fooBar") => "foo/bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The path/case string or empty string if input is not a string
 */
export function pathCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .replace(/\s+/g, "/")
    .replace(/[A-Z]/g, (letter) => `/${letter.toLowerCase()}`)
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .toLowerCase();
}

/**
 * Converts a string to lowercase.
 *
 * @example
 * lowerCase("Hello World") => "hello world"
 *
 * @param {any} str - The string to convert
 * @returns {string} The lowercase string or empty string if input is not a string
 */
export function lowerCase(str: unknown): string {
  if (!isString(str)) return "";
  return str.toLowerCase();
}

/**
 * Converts a string to UPPERCASE.
 *
 * @example
 * upperCase("hello world") => "HELLO WORLD"
 *
 * @param {any} str - The string to convert
 * @returns {string} The UPPERCASE string or empty string if input is not a string
 */
export function upperCase(str: unknown): string {
  if (!isString(str)) return "";
  return str.toUpperCase();
}

/**
 * Converts a string to SCREAMING_SNAKE_CASE format.
 *
 * @example
 * screamingSnakeCase("hello world") => "HELLO_WORLD"
 * screamingSnakeCase("fooBar") => "FOO_BAR"
 *
 * @param {any} str - The string to convert
 * @returns {string} The SCREAMING_SNAKE_CASE string or empty string if input is not a string
 */
export function screamingSnakeCase(str: unknown): string {
  if (!isString(str)) return "";
  return snakeCase(str).toUpperCase();
}

/**
 * Converts a string to Sentence case format.
 *
 * @example
 * sentenceCase("helloWorld") => "Hello world"
 * sentenceCase("foo_bar") => "Foo bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The Sentence case string or empty string if input is not a string
 */
export function sentenceCase(str: unknown): string {
  if (!isString(str)) return "";
  const result = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Converts a string to Title Case format.
 *
 * @example
 * titleCase("hello world") => "Hello World"
 * titleCase("foo_bar") => "Foo Bar"
 *
 * @param {any} str - The string to convert
 * @returns {string} The Title Case string or empty string if input is not a string
 */
export function titleCase(str: unknown): string {
  if (!isString(str)) return "";
  return str
    .toLowerCase()
    .replace(/[_\-.]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncates a string to a specified length and adds a suffix.
 *
 * @example
 * truncate("Hello world", 5) => "Hello..."
 * truncate("Hello world", 7, "!") => "Hello w!"
 *
 * @param {any} str - The string to truncate
 * @param {any} limit - Maximum length of the result (not including suffix)
 * @param {any} [suffix="..."] - String to append if truncation occurs
 * @returns {string} The truncated string or empty string if inputs are invalid
 */
export function truncate(str: unknown, limit: unknown, suffix: unknown = "..."): string {
  if (!isString(str) || !isNumber(limit) || !isString(suffix)) return "";
  return str.length <= limit ? str : str.slice(0, limit) + suffix;
}

/**
 * Truncates a string to a specified number of words and adds a suffix.
 *
 * @example
 * truncateWords("Hello beautiful world", 2) => "Hello beautiful..."
 *
 * @param {any} str - The string to truncate
 * @param {any} wordLimit - Maximum number of words to include
 * @param {any} [suffix="..."] - String to append if truncation occurs
 * @returns {string} The truncated string or empty string if inputs are invalid
 */
export function truncateWords(str: unknown, wordLimit: unknown, suffix: unknown = "..."): string {
  if (!isString(str) || !isNumber(wordLimit) || !isString(suffix)) return "";
  const words = str.split(/\s+/);
  return words.length <= wordLimit ? str : words.slice(0, wordLimit).join(" ") + suffix;
}

/**
 * Adds an ellipsis to a string if it exceeds a specified length.
 * This is an alias for truncate().
 *
 * @example
 * ellipsis("Hello world", 5) => "Hello..."
 *
 * @param {any} str - The string to process
 * @param {any} limit - Maximum length before adding ellipsis
 * @returns {string} The string with ellipsis or empty string if inputs are invalid
 */
export function ellipsis(str: unknown, limit: unknown): string {
  return truncate(str, limit);
}

/**
 * Appends a string to another string.
 *
 * @example
 * append("Hello", " world") => "Hello world"
 *
 * @param {any} str - The base string
 * @param {any} toAppend - The string to append
 * @returns {string} The combined string or empty string if inputs are invalid
 */
export function append(str: unknown, toAppend: unknown): string {
  if (!isString(str) || !isString(toAppend)) return "";
  return str + toAppend;
}

/**
 * Prepends a string to another string.
 *
 * @example
 * prepend("world", "Hello ") => "Hello world"
 *
 * @param {any} str - The base string
 * @param {any} toPrepend - The string to prepend
 * @returns {string} The combined string or empty string if inputs are invalid
 */
export function prepend(str: unknown, toPrepend: unknown): string {
  if (!isString(str) || !isString(toPrepend)) return "";
  return toPrepend + str;
}

/**
 * Removes all occurrences of a substring from a string.
 *
 * @example
 * remove("Hello world", "o") => "Hell wrld"
 *
 * @param {any} str - The base string
 * @param {any} toRemove - The substring to remove
 * @returns {string} The string with removals or empty string if inputs are invalid
 */
export function remove(str: unknown, toRemove: unknown): string {
  if (!isString(str) || !isString(toRemove)) return "";
  const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return str.replace(new RegExp(escaped, "g"), "");
}

/**
 * Collection of string transformation helper functions.
 */
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

/**
 * Registers all string transformation functions as Handlebars helpers.
 * This makes them available for use in templates.
 */
export function registerStringHelpers() {
  for (const [name, fn] of Object.entries(stringHelpers)) {
    Handlebars.registerHelper(name, fn);
  }
}
