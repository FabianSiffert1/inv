module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-refresh'],
  settings: {
    react: { version: 'detect' }
  },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  root: true
}
