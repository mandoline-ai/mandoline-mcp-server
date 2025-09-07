// This configuration evaluates the project's own code changes

export default [
  {
    name: 'src',
    files: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
    ignores: ['src/__tests__/**/*'],
    rules: {
      'architecture-consistency': {
        metricId: '939608a0-e123-4272-86cb-f09622a923c2', // Patterns that enable rapid iteration vs rigidity
        threshold: -0.1,
      },
      'intent-implementation': {
        metricId: '4e91e7fb-d49a-4ae9-967f-558cc5fec712', // Semantic alignment with focus on core problem solving
        threshold: -0.1,
      },
      'code-quality': {
        metricId: '682158de-207a-4f61-81b6-207f4f40ac05', // Readable, maintainable, pragmatic code quality
        threshold: -0.1,
      },
    },
  },
  {
    name: 'tests',
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    rules: {
      'test-quality': {
        metricId: '6070d5a1-d318-404a-9b93-e7a4f276ac08', // Critical paths over comprehensive coverage
        threshold: -0.333,
      },
    },
  },
  {
    name: 'docs',
    files: ['*.md', 'docs/**/*'],
    rules: {
      'documentation-quality': {
        metricId: '1d000831-83df-4d0f-b244-f432dd8d5778', // Clear, insight-dense docs that teach vs describe
        threshold: -0.1,
      },
    },
  },
];
