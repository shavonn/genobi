import Handlebars from "handlebars";
import { includedHelpers } from "../../../src/utils/helpers/included-helpers";

describe("registerHelpers", () => {
  it("should register all included Handlebars helpers", () => {
    vi.spyOn(Handlebars, "registerHelper");

    includedHelpers.register();

    expect(Handlebars.registerHelper).toHaveBeenCalledTimes(17);
  });
});
