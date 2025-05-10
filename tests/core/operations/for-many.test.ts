import type { CreateOperation } from "../../../src";
import { store } from "../../../src/config-store";
import { operationHandler } from "../../../src/core/operation-handler"; // tests/core/operations/for-many.test.ts
import { operationDecorator } from "../../../src/core/operations/operation-decorator";
import { ops } from "../../../src/core/operations/ops";
import { logger } from "../../../src/utils/logger";
import { testData } from "../../__fixtures__/test-data";

describe("forMany", () => {
	beforeEach(() => {
		// Mock the operationHandler.handle function
		vi.spyOn(operationHandler, "handle").mockImplementation(() => Promise.resolve());

		// Add the test generator to the store
		store.setGenerator(testData.component.id, testData.component.generator);
	});

	it("should process all operations of the target generator for each item in the items array", async () => {
		const operation = operationDecorator.forMany(testData.makeForManyOperation());
		const parentData = { theme: { name: "light", primary: "blue-500" } };

		await ops.forMany(operation, parentData);

		// 3 items × 3 operations per generator = 9 operation calls
		expect(operationHandler.handle).toHaveBeenCalledTimes(9);

		// Check first item's first operation call
		expect(operationHandler.handle).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				name: "button",
				theme: { name: "light", primary: "blue-500" },
			}),
		);
	});

	it("should accept a function that returns an items array", async () => {
		const itemsFunction = (data: any) => {
			return [`${data.prefix}1`, `${data.prefix}2`].map((name) => ({ name }));
		};

		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				items: itemsFunction,
			}),
		);
		const parentData = { prefix: "component-" };

		await ops.forMany(operation, parentData);

		// 2 items × 3 operations per generator = 6 operation calls
		expect(operationHandler.handle).toHaveBeenCalledTimes(6);

		// Check data passed to operations
		expect(operationHandler.handle).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				name: "component-1",
				prefix: "component-",
			}),
		);
		expect(operationHandler.handle).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				name: "component-2",
				prefix: "component-",
			}),
		);
	});

	it("should transform item data if transformItem function is provided", async () => {
		const transformItem = (item: any, index: number, parentData: any) => {
			return {
				name: `${parentData.prefix}-${item}`,
				index,
			};
		};

		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				items: ["button", "card", "modal"],
				transformItem,
			}),
		);
		const parentData = { prefix: "ui" };

		await ops.forMany(operation, parentData);

		// Check transformed data was passed correctly
		expect(operationHandler.handle).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				name: "ui-button",
				index: 0,
				prefix: "ui",
			}),
		);
		expect(operationHandler.handle).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				name: "ui-card",
				index: 1,
				prefix: "ui",
			}),
		);
	});

	it("should throw error if target generator is not found", async () => {
		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				generatorId: "non-existent-generator",
			}),
		);
		const parentData = {};

		await expect(ops.forMany(operation, parentData)).rejects.toThrow(
			'Generator "non-existent-generator" referenced in forMany operation was not found.',
		);
	});

	it("should throw error if target generator has no operations", async () => {
		// Create generator with no operations
		store.setGenerator("empty-generator", {
			description: "Empty Generator",
			prompts: [],
			operations: [],
		});

		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				generatorId: "empty-generator",
			}),
		);
		const parentData = {};

		await expect(ops.forMany(operation, parentData)).rejects.toThrow(
			'No operations found for generator "empty-generator".',
		);
	});

	it("should throw error if items is not an array or function", async () => {
		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				items: "not-an-array" as any,
			}),
		);
		const parentData = {};

		await expect(ops.forMany(operation, parentData)).rejects.toThrow(
			'The "items" property must be an array or a function that returns an array.',
		);
	});

	it("should continue processing if an operation error occurs and haltOnError is false", async () => {
		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				haltOnError: false,
			}),
		);
		const parentData = {};

		// Make the first call throw an error
		vi.spyOn(operationHandler, "handle")
			.mockImplementationOnce(() => Promise.reject(new Error("Test error")))
			.mockImplementation(() => Promise.resolve());

		await ops.forMany(operation, parentData);

		// Should log the error but continue processing
		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Operation failed."), "Test error");

		// Should continue with the remaining operations
		expect(operationHandler.handle).toHaveBeenCalledTimes(9);
	});

	it("should stop processing if an operation error occurs and haltOnError is true", async () => {
		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				haltOnError: true,
			}),
		);
		const parentData = {};

		// Make the first call throw an error
		vi.spyOn(operationHandler, "handle")
			.mockImplementationOnce(() => Promise.reject(new Error("Test error")))
			.mockImplementation(() => Promise.resolve());

		await expect(ops.forMany(operation, parentData)).rejects.toThrow("Test error");

		// Should log the error
		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Operation failed."), "Test error");

		// Should stop after the first operation
		expect(operationHandler.handle).toHaveBeenCalledTimes(1);
	});

	it("should log start and completion of forMany operation", async () => {
		const operation = operationDecorator.forMany(testData.makeForManyOperation());
		const parentData = {};

		await ops.forMany(operation, parentData);

		expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Running forMany operation with 3 items"));
		expect(logger.success).toHaveBeenCalledWith("ForMany operation completed with 3 items");
	});

	it("should skip operations that have skip function returning true", async () => {
		// Mock operation with skip function
		const skipOperation: CreateOperation = {
			type: "create",
			filePath: "test.txt",
			templateStr: "test",
			skip: () => true,
		};

		// Create generator with skip operation
		store.setGenerator("skip-generator", {
			description: "Skip Generator",
			prompts: [],
			operations: [skipOperation],
		});

		const operation = operationDecorator.forMany(
			testData.makeForManyOperation({
				generatorId: "skip-generator",
			}),
		);
		const parentData = {};

		await ops.forMany(operation, parentData);

		// Should not call handle for skipped operations
		expect(operationHandler.handle).not.toHaveBeenCalled();
	});
});
