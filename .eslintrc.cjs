module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    './.eslintrc-auto-import.json',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    node: {
      extensions: ['.ts', '.tsx'],
      moduleDirectory: ['node_modules', 'src'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    //这里是添加的代码
    {
      files: [
        'src/pages/**/*.vue',
        'src/pages/**/**/*.vue',
        'src/components/**/*.vue',
        'src/components/**/**/index.vue',
      ], // 匹配views和二级目录中的index.vue
      rules: {
        'vue/multi-word-component-names': 'off',
      }, //给上面匹配的文件指定规则
    },
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': ['error', 'unix'],
    'vue/comment-directive': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/extensions': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
      },
    ],
    'import/named': 'off',
    'import/no-unresolved': 'off',
  },
};
