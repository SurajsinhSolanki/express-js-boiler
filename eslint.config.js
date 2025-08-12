import eslintRecommended from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  eslintRecommended.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
    }
  },
  {
    name: 'Prettier',
    rules: prettier.rules
  },
  {
    ignores: [
      'coverage',
      'node_modules',
      'dist',
      'build',
      'dist-ssr',
      '*.local',
      '.env',
      'generated/prisma',
      '.idea',
      '.DS_Store',
      '*.suo',
      '*.ntvs*',
      '*.njsproj',
      '*.sln',
      '*.sw?'
    ]
  }
];
