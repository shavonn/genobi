---
"genobi": patch
---

Mutable Singleton State Fix

* Refactored store to support both singleton and isolated instances
* Wrapped store method calls in arrow functions to preserve this binding in api