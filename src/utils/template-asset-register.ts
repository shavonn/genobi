import Handlebars from "handlebars";
import { store } from "../config-store";
import { includedHelpersRegister } from "./helpers/included-helpers-register";

function registerConfiguredHelpers() {
	for (const [name, helper] of store.state().helpers) {
		Handlebars.registerHelper(name, helper);
	}
}

const templateAssetRegister = {
	register: () => {
		includedHelpersRegister.register();
		registerConfiguredHelpers();
	},
};
export { templateAssetRegister };
