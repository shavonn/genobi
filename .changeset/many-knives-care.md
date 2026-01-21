---
"genobi": patch
---

TOCTOU (time-of-check-time-of-use) Fix

* Added WriteOptions interface with exclusive flag. The writeToFile() function now supports { exclusive: true } which
  uses the Node.js 'wx' flag for atomic file creation that fails if the file already exists.
* Updated to use atomic exclusive writes. When skipIfExists is false and overwrite is false, it uses { exclusive: true }
  to atomically fail if the file exists, preventing race conditions.
* Same atomic write pattern applied for the createAll operation.
* Tests updated to properly spy on fileSys.fileExists and content.getSingleFileContent where needed, and fixed the test
  that was incorrectly setting templateFilePath: undefined without providing a templateStr.    