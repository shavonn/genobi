import { amendFile, append, prepend } from "./amend";
import { create } from "./create";
import { createAll } from "./create-all";

const ops = { amendFile, append, create, createAll, prepend };
export { ops };
