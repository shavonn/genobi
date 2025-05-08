import Handlebars from "handlebars";
import { includedHelpersRegister } from "../../../src/utils/helpers/included-helpers-register";

describe("registerHelpers", () => {
	it("should register all included Handlebars helpers", () => {
		vi.spyOn(Handlebars, "registerHelper");

		includedHelpersRegister.register();

		expect(Handlebars.registerHelper).toHaveBeenCalledTimes(17);
	});
});
