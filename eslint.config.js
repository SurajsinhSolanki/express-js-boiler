import eslintRecommended from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
    eslintRecommended.configs.recommended,

    ...tseslint.configs.recommended, // includes parser + plugin

    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },

    {
        name: 'Prettier',
        rules: prettier.rules
    }
];
