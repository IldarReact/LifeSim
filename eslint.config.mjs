import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

const isProd = process.env.NODE_ENV === 'production'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
      next: nextPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-func-assign': 'warn',
      'no-redeclare': 'warn',
      'no-shadow': 'warn',
      'no-inner-declarations': 'warn',
      'no-param-reassign': 'warn',
      'no-var': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': isProd ? 'error' : 'warn',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
      'no-empty': 'warn',
      'no-constant-binary-expression': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-case-declarations': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
      next: nextPlugin,
    },
    rules: {
      'no-func-assign': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'no-inner-declarations': 'error',
      'no-param-reassign': 'error',
      'no-var': 'error',
      'no-console': isProd ? 'error' : 'warn',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
      'no-empty': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-case-declarations': 'warn',
    },
  },
  {
    ignores: ['node_modules', '.next', 'dist', 'build'],
  },
]
