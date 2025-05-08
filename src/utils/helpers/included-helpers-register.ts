import { registerStringHelpers } from "./string-transformers";

function registerIncludedHelpers() {
	registerStringHelpers();
}

const includedHelpersRegister = {
	register: registerIncludedHelpers,
};
export { includedHelpersRegister };
