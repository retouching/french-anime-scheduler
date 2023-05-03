module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  rules: {
    quotes: ['error', 'single'],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/strict-boolean-expressions': 0,
    semi: 0,
    'space-before-function-paren': 0,
    '@typescript-eslint/space-before-function-paren': ['error', 'never'],
    '@typescript-eslint/prefer-nullish-coalescing': 0
  }
};
