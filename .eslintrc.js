module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true },
    ],
    // from xo.js
    // https://github.com/xojs/eslint-config-xo/blob/main/index.js
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: /^_/.source,
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: /^_$/.source,
      },
    ],
  },
};
