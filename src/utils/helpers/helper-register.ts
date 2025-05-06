import Handlebars from "handlebars";
import { store } from "../../config-store";
import { registerStringHelpers } from "./string-transformers";

function registerHelpers() {
	registerStringHelpers();

	for (const [name, helper] of store.state().helpers) {
		Handlebars.registerHelper(name, helper);
	}
}

const helperRegister = {
	register: registerHelpers,
};
export { helperRegister };
