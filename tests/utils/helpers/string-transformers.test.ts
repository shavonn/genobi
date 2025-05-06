import { stringHelpers } from "../../../src/utils/helpers/string-transformers";

describe("stringHelpers", () => {
	const {
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
	} = stringHelpers;

	let quote = "Wubba Lubba Dub Dub";
	let altQuote = "Get Schwifty in here";
	beforeEach(() => {
		quote = "Wubba Lubba Dub Dub";
		altQuote = "Get Schwifty in here";
	});

	// --- Basic string transformers ---

	it("camelCase", () => {
		expect(camelCase(quote)).toBe("wubbaLubbaDubDub");
		expect(camelCase(123)).toBe("");
	});

	it("snakeCase", () => {
		expect(snakeCase(quote)).toBe("wubba_lubba_dub_dub");
		expect(snakeCase(true)).toBe("");
	});

	it("kebabCase", () => {
		expect(kebabCase(quote)).toBe("wubba-lubba-dub-dub");
		expect(kebabCase(null)).toBe("");
	});

	it("dotCase", () => {
		expect(dotCase(quote)).toBe("wubba.lubba.dub.dub");
		expect(dotCase(undefined)).toBe("");
	});

	it("pascalCase", () => {
		expect(pascalCase(quote)).toBe("WubbaLubbaDubDub");
		expect(pascalCase({})).toBe("");
	});

	it("pathCase", () => {
		expect(pathCase(quote)).toBe("wubba/lubba/dub/dub");
		expect(pathCase([])).toBe("");
	});

	it("lowerCase", () => {
		expect(lowerCase(quote)).toBe("wubba lubba dub dub");
		expect(lowerCase(42)).toBe("");
	});

	it("upperCase", () => {
		expect(upperCase(quote)).toBe("WUBBA LUBBA DUB DUB");
		expect(upperCase(false)).toBe("");
	});

	it("screamingSnakeCase", () => {
		expect(screamingSnakeCase(quote)).toBe("WUBBA_LUBBA_DUB_DUB");
		expect(screamingSnakeCase([])).toBe("");
	});

	it("sentenceCase", () => {
		expect(sentenceCase("wubbaLubbaDubDub")).toBe("Wubba lubba dub dub");
		expect(sentenceCase(123)).toBe("");
	});

	it("titleCase", () => {
		expect(titleCase(quote)).toBe("Wubba Lubba Dub Dub");
		expect(titleCase(true)).toBe("");
	});

	// --- Multi-param functions ---

	it("truncate", () => {
		expect(truncate(altQuote, 10)).toBe("Get Schwif...");
		expect(truncate("Pickle Rick!", 20)).toBe("Pickle Rick!");
		expect(truncate("I turned myself into a pickle, Morty!", "bad", "?!")).toBe("");
		expect(truncate(12345, 3)).toBe("");
	});

	it("truncateWords", () => {
		expect(truncateWords("Get Schwifty in here now", 3)).toBe("Get Schwifty in...");
		expect(truncateWords("I am the Rickest Rick there is", 10)).toBe("I am the Rickest Rick there is");
		expect(truncateWords("Tiny Rick forever!", "bad")).toBe("");
		expect(truncateWords(123, 2)).toBe("");
	});

	it("ellipsis", () => {
		expect(ellipsis(altQuote, 10)).toBe("Get Schwif...");
		expect(ellipsis("Pickle Rick!", 20)).toBe("Pickle Rick!");
		expect(ellipsis("I turned myself into a pickle, Morty!", "bad")).toBe("");
		expect(ellipsis(12345, 3)).toBe("");
	});

	it("append", () => {
		expect(append("Morty", ", you little fool!")).toBe("Morty, you little fool!");
		expect(append("I'm Mr. Meeseeks!", 42)).toBe("");
		expect(append(123, " Look at me!")).toBe("");
	});

	it("prepend", () => {
		expect(prepend("is the reason Grandpa Rick drinks", "Summer ")).toBe("Summer is the reason Grandpa Rick drinks");
		expect(prepend(123, "Summer ")).toBe("");
		expect(prepend("Morty", null)).toBe("");
	});

	it("remove", () => {
		expect(remove("I'm Pickle Rick!", "Pickle ")).toBe("I'm Rick!");
		expect(remove("Existence is pain to a Meeseeks", "pain")).toBe("Existence is  to a Meeseeks");
		expect(remove("Total Rickall", 42)).toBe("");
		expect(remove(42, "Rick")).toBe("");
	});
});
