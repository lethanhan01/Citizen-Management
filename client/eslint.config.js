import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

// --- BỔ SUNG 2 IMPORT SAU ---
import react from 'eslint-plugin-react'; // 1. Import plugin React cơ bản
import prettierConfig from 'eslint-config-prettier'; // 2. Import config của Prettier

const reactRecommendedRules = react.configs?.recommended?.rules ?? {};
const reactHooksRecommendedRules =
  reactHooks.configs?.['recommended-latest']?.rules ??
  reactHooks.configs?.recommended?.rules ??
  {};
const reactRefreshRules = reactRefresh.configs?.vite?.rules ?? {};

export default defineConfig([
  globalIgnores(['dist', 'node_modules/', 'build/']), // Thêm ignore
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    // --- BỔ SUNG 'SETTINGS' CHO REACT ---
    settings: {
      react: {
        version: 'detect', // Tự động phát hiện phiên bản React
      },
    },
    // --- BỔ SUNG 'RULES' (TÙY CHỈNH) ---
    rules: {
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      ...reactRefreshRules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-empty': 'off',
      'no-empty-pattern': 'off',
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off', // Tắt vì dùng Vite + React 17+
      'react-refresh/only-export-components': 'warn',
      'react/prop-types': 'off', // Tắt nếu bạn dùng TypeScript
    },
  },
]);