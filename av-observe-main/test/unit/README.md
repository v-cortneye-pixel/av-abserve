# Unit tests

Run all unit tests:

```bash
npm run test:unit
```

That invokes Node's built-in test runner (`node --test test/unit`), so no
extra dependencies are required. Add new specs as `*.test.js` files anywhere
under this directory.

## Conventions

- Tests target **pure functions** that don't need network / file-system
  access. Anything that talks to a real API belongs in `test/scenarios/`,
  which has the existing interactive runner.
- Imports should reach into the app or shared modules directly:

  ```js
  import { strict as assert } from 'node:assert';
  import { describe, it } from 'node:test';
  ```

- Keep specs small and deterministic; the test suite is meant to run in CI
  on every push.

## Why `node --test`?

It ships with Node 20 (matching `.nvmrc`), needs zero `devDependencies`,
and produces TAP output that GitHub Actions renders inline. If/when the
suite grows enough to justify Vitest or Jest, swap the runner and the
specs in this directory move over with one-line shim edits.
