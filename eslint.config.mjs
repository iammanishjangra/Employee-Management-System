import globals from 'globals';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  {
    ignores: [
      'frontend/dist/**',
      'node_modules/**',
      'terraform/.terraform/**',
      'coverage/**'
    ]
  },
  ...tseslint.configs.recommended,
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './frontend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.browser
      }
    }
  }
];

export default eslintConfig;
