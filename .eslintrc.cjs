module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'eslint-plugin-react-compiler',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
    // 'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'react-compiler/react-compiler': 2,
    'react-refresh/only-export-components': 'warn'
    // 'no-unused-vars': 1
  }
};
