// ESLint flat config for av-observe.
//
// This file is intentionally permissive — it codifies a safety net (catching
// real bugs like undefined vars and unused imports) without rewriting the
// repo's existing style. Stylistic concerns are deferred to Prettier.
//
// To enable:
//   npm install -D eslint @eslint/js globals
//   npx eslint .
//
// Once devDependencies land, a `lint` script should be added to package.json.

import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: [
			'**/node_modules/**',
			'**/.ignore/**',
			'**/.data/**',
			'**/coverage/**',
			'apps/av-alerts-api/code/**', // legacy snapshot; see MAINTENANCE.md
			'apps/av-alerts-api/temp-package/**',
			'**/*.zip',
			'data-output.json',
		],
	},

	js.configs.recommended,

	{
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		rules: {
			// Real-bug catchers
			'no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			}],
			'no-undef': 'error',
			'no-empty': ['warn', { allowEmptyCatch: true }],
			'no-constant-condition': ['warn', { checkLoops: false }],
			'no-prototype-builtins': 'off',
			'no-case-declarations': 'off',

			// Async/await footguns relevant to this codebase
			'no-async-promise-executor': 'error',
			'require-atomic-updates': 'off',

			// Allow console — this app deliberately uses console for ops logging
			'no-console': 'off',
		},
	},

	{
		files: ['apps/av-alerts-api/**/*.{js,mjs,cjs}'],
		languageOptions: {
			globals: {
				...globals.node,
				// Lambda runtime globals (none beyond node, but reserved for future)
			},
		},
	},

	{
		files: ['test/**/*.{js,mjs,cjs}'],
		rules: {
			'no-unused-vars': 'off',
		},
	},
];
