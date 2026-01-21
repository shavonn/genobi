---
"genobi": minor
---

Custom operations

Implements custom operations functionality for Genobi, allowing users to define custom operation logic either inline or as reusable registered operations. The feature provides two ways to use custom operations: (1) inline custom operations with type: "custom" and an action function for one-off use cases, and (2) registered operations via the addOperation API that can be referenced by name for reusable operations.

Changes:
* Added support for inline custom operations with action functions
* Added addOperation API to register reusable custom operations
* Added validation for custom operations and operation registration