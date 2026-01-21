---
"genobi": patch
---

Path validation

* Added resolveSafePath - New function for validating plain paths (non-templates) that:
    - Resolves the path relative to a root directory
    - Validates the path stays within bounds using validatePathWithinRoot
    - Throws PathTraversalError if path escapes destination
* Fixed replaceInFile - Now uses resolveSafePath instead of raw path.resolve, preventing path traversal attacks in custom      
   operations
* Added tests - 4 new tests for resolveSafePath, plus updated custom operation tests        
