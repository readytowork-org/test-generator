import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from 'typescript-eslint'

export default tseslint.config({ignores: ['dist']}, {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        ecmaVersion: 2020,
        globals: globals.browser,
    },
    plugins: {
        react,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['warn', {allowConstantExport: true},],
        ...react.configs.recommended.rules,
        'react/react-in-jsx-scope': 0,
        ...eslintConfigPrettier.rules
    },
},)
