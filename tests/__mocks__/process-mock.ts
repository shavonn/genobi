vi.mock("process", { spy: true });

vi.spyOn(process, "exit").mockImplementation((code) => {
	throw new Error(`process.exit unexpectedly called with "${code}"`);
});
