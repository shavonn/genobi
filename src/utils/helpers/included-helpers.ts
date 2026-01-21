import { registerStringHelpers } from "./string-transformers";

function registerIncludedHelpers() {
  registerStringHelpers();
}

const includedHelpers = {
  register: registerIncludedHelpers,
};
export { includedHelpers };
