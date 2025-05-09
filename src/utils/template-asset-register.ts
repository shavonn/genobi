import Handlebars from "handlebars";
import { store } from "../config-store";
import { includedHelpersRegister } from "./helpers/included-helpers-register";

function registerConfiguredHelpers() {
	for (const [name, helper] of store.state().helpers) {
		Handlebars.registerHelper(name, helper);
	}
}

function registerConfiguredPartials() {
	for (const [name, partial] of store.state().partials) {
		Handlebars.registerPartial(name, partial);
	}
}

const templateAssetRegister = {
	register: () => {
		includedHelpersRegister.register();
		registerConfiguredHelpers();
		registerConfiguredPartials();
	},
};
export { templateAssetRegister };
