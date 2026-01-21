# genobi

## 0.8.0

### Minor Changes

- bf58421: Custom operations

  Implements custom operations functionality for Genobi, allowing users to define custom operation logic either inline or as reusable registered operations. The feature provides two ways to use custom operations: (1) inline custom operations with type: "custom" and an action function for one-off use cases, and (2) registered operations via the addOperation API that can be referenced by name for reusable operations.

  Changes:

  - Added support for inline custom operations with action functions
  - Added addOperation API to register reusable custom operations
  - Added validation for custom operations and operation registration

## 0.7.1

### Patch Changes

- e092cde: Path Traversal Vulnerability Fix

  - The fix validates that any template-processed path resolves within the destination base directory

- fe75b3b: TOCTOU (time-of-check-time-of-use) Fix

  - Added WriteOptions interface with exclusive flag. The writeToFile() function now supports { exclusive: true } which
    uses the Node.js 'wx' flag for atomic file creation that fails if the file already exists.
  - Updated to use atomic exclusive writes. When skipIfExists is false and overwrite is false, it uses { exclusive: true }
    to atomically fail if the file exists, preventing race conditions.
  - Same atomic write pattern applied for the createAll operation.
  - Tests updated to properly spy on fileSys.fileExists and content.getSingleFileContent where needed, and fixed the test
    that was incorrectly setting templateFilePath: undefined without providing a templateStr.

- fe40cd7: Mutable Singleton State Fix

  - Refactored store to support both singleton and isolated instances
  - Wrapped store method calls in arrow functions to preserve this binding in api

- c7f452d: CLI option type mismatch

  - Added type safety for parsed CLI options
  - Fixed -v --verbose <string> to -v, --verbose - The verbose option was incorrectly expecting a string value, but
    enableVerboseLogging() takes no arguments. Changed to a boolean flag.
  - Fixed option syntax - Changed -d --destination to -d, --destination (proper Commander.js short/long option separator
    with comma)
  - Added type annotation to program.opts() - Changed to program.opts<CliOptions>() for proper TypeScript type inference

## 0.7.0

### Minor Changes

- 13da455: Fix operation type issue

## 0.6.0

### Minor Changes

- 0a1362f: Implementing type fix, removing excess logs

## 0.5.1

### Patch Changes

- 5bcf6f0: Update expected partial file types

## 0.5.0

### Minor Changes

- 962ea7c: Add setDestinationBasePath to config api

### Patch Changes

- 596a347: Fix config patterns for search

## 0.4.0

### Minor Changes

- 0d5d562: Add validation to config api methods

## 0.3.1

### Patch Changes

- 1d345ce: Better debug and verbose logs

## 0.3.0

### Minor Changes

- 42d547a: Add ForMany operation
  ForMany: Run specified generator for multiple datasets

## 0.2.0

### Minor Changes

- 8d0cf81: Add Handlebars partials, other improvements

  - Added Handlebars partials to config API
    - Also add partials from template file source
  - Error handling for config api funcs
  - jsdocs for better dev experience
  - Updated README.md
  -

## 0.1.0

### Minor Changes

- afcfef2: Init release

  - Config API
  - Generator Config
  - Operations: Create, Create All, Append, and Prepend
  - String helpers
