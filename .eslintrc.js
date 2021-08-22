module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  env: {
    'browser': true,
    'node': true,
    'mocha': true,
    'es2017': true
  },
  'extends': ['eslint:recommended','plugin:@typescript-eslint/recommended'],
  'globals': {
    'Uint8Array': false,
    'define': false,
    'Float32Array': false
  },
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  },
  'ignorePatterns': [
    '/dist'
  ]
};
