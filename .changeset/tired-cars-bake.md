---
"genobi": patch
---

CLI option type mismatch

* Added type safety for parsed CLI options
* Fixed -v --verbose <string> to -v, --verbose - The verbose option was incorrectly expecting a string value, but
  enableVerboseLogging() takes no arguments. Changed to a boolean flag.
* Fixed option syntax - Changed -d --destination to -d, --destination (proper Commander.js short/long option separator
  with comma)
* Added type annotation to program.opts() - Changed to program.opts<CliOptions>() for proper TypeScript type inference   