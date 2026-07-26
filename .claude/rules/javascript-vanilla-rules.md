---
paths:
  - "js/**/*.js"
---

# Vanilla JavaScript Protection Rules

NexArtWO uses vanilla JavaScript. Large global files can create hidden dependencies.

Before editing:
- identify exact function
- search call sites
- verify event listeners
- verify DOM IDs/classes
- preserve state shape
- avoid duplicate global functions
- avoid broad rewrites

Never:
- rename global functions without call-site audit
- change shared state object names casually
- move event listeners unless documented
- remove fallback logic
