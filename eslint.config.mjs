import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Decorator[expression.callee.name='Component'] > CallExpression > ObjectExpression > Property:matches([key.name=/^(template|styles)$/], [key.value=/^(template|styles)$/])",
          message: 'Move component templates and styles to separate files.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
  },
];
