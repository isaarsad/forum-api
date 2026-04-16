import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import daStyle from 'eslint-config-dicodingacademy';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default defineConfig([
  js.configs.recommended,
  daStyle,
  {
    plugins: {
      vitest,
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      ...vitest.configs.recommended.rules,
    },
  },
]);
