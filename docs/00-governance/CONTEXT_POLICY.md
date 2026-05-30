# CONTEXT_POLICY — NexArtWO

## Purpose

Prevent context overload and hallucinated connections.

## Agent should read in this order

1. Root instructions.
2. Memory.
3. Active task.
4. Module spec.
5. Architecture map.
6. Specific source file/function.

## Do not

- Load entire repo first.
- Paste giant files into prompts.
- Ask agent to "understand everything."
- Ask broad tasks like "fix the app."

## Do

- Provide exact error.
- Provide exact file/function when possible.
- Use one issue per task.
- Use allowed/forbidden file lists.
