import Handlebars from "handlebars";
import { helperRegister } from "../../../src/utils/helpers/helper-register";

describe("registerHelpers", () => {
	it("should register all included Handlebars helpers", () => {
		vi.spyOn(Handlebars, "registerHelper");

		helperRegister.register();

		expect(Handlebars.registerHelper).toHaveBeenCalledTimes(17);
	});
});
