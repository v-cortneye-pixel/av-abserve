// Smoke test: proves the node --test harness is wired up and runnable in CI
// without any dependencies. Replace with real unit tests as they are written.

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

describe('smoke', () => {
	it('runs a passing assertion', () => {
		assert.equal(1 + 1, 2);
	});

	it('supports async tests', async () => {
		const value = await Promise.resolve(42);
		assert.equal(value, 42);
	});
});
