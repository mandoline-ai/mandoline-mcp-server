import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Prefer single quotes with template literal support and string concatenation
      'quotes': ['error', 'single', { 
        allowTemplateLiterals: true,
        avoidEscape: true 
      }],
      // Require semicolons
      'semi': ['error', 'always'],
      // Prefer const for variables that are never reassigned
      'prefer-const': 'error',
      // Disallow unused variables except those prefixed with underscore
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Allow explicit any when necessary (common in MCP server development)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
    ],
  }
);