# EVENT_HANDLERS_AND_DOM_CONTRACT — NexArtWO

## Purpose

Protect DOM IDs, classes and event listeners.

## Rules

- Do not rename IDs/classes without searching usage.
- Do not remove inline handlers without replacing event binding.
- Do not change modal IDs without updating JS.
- Do not change tab IDs without updating routing/render logic.
- Document new important DOM hooks.

## Before UI change

Check:

- HTML selector
- JS selector
- CSS selector
- event listener
- mobile behavior
