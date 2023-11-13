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
    '@typescript-eslint/prefer-nullish-coalescing': 0,
    'max-len': ['error', 130],
    'max-lines': ['error', 300],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'quote-props': ['error', 'as-needed'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false },
        multilineDetection: 'brackets'
      }
    ],
    '@typescript-eslint/no-extraneous-class': ['error', {
      allowStaticOnly: true
    }]
  }
};
