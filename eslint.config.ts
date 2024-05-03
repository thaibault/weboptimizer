import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import {FlatCompat} from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

// Mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname})

export default [
    js.configs.recommended,
    ...compat.extends('plugin:@typescript-eslint/eslint-recommended'),
    ...compat.extends('plugin:@typescript-eslint/recommended-requiring-type-checking'),
    ...compat.extends('google'),
    jsdoc.configs['flat/recommended'],

    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            },
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },
                impliedStrict: true,
                project: 'node_modules/weboptimizer/tsconfigLibrary.json',
            },
            sourceType: 'module'
        },
        ignores: [
            '**/exclude/*', '*.compiled.*', '*.d.ts', '*.js'
        ],
        plugins: {
            jsdoc,
            typescriptPlugin
        },

        rules: {
            '@typescript-eslint/no-non-null-assertion': 0,
            '@typescript-eslint/no-this-alias': [
                'error',
                {allowedNames: ['self']}
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    'argsIgnorePattern': '^_',
                    'varsIgnorePattern': '^_'
                }
            ],
            '@typescript-eslint/type-annotation-spacing': [
                'error',
                {
                    after: false,
                    before: false,
                    overrides: {
                        arrow: {
                            after: true,
                            before: true
                        }
                    }
                }
            ],
            'arrow-parens': ['error', 'always'],
            'block-scoped-var': 0,
            camelcase: ['error', {properties: 'always'}],
            'comma-dangle': ['error', 'never'],
            curly: ['error', 'multi'],
            indent: ['error', 4, {ignoreComments: true}],
            'max-nested-callbacks': ['error', 10],

            'new-cap': 0,

            'no-invalid-this': 0,
            'no-unused-vars': [
                'error',
                {
                    'argsIgnorePattern': '^_',
                    'varsIgnorePattern': '^_'
                }
            ],
            'no-constant-condition': 0,
            'no-new-func': 0,
            'no-new-wrappers': 0,

            'quote-props': [
                'error',
                'as-needed',
                {
                    numbers: true
                }
            ],

            semi: [
                'error',
                'never'
            ],

            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    asyncArrow: 'always',
                    named: 'never'
                }
            ],
            'spaced-comment': [
                'error',
                'always',
                {
                    line: {
                        exceptions: [
                            '/usr/bin/env node'
                        ]
                    },
                    markers: [
                        '/',
                        '//',
                        '///'
                    ]
                }
            ],
            'space-infix-ops': 0,

            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/require-description-complete-sentence': 'error',
            'jsdoc/require-hyphen-before-param-description': 'error',
            'jsdoc/require-param': 0,
            'jsdoc/require-param-description': 'error',
            'jsdoc/require-param-type': 0,
            'jsdoc/require-returns-description': 'error',
            'jsdoc/require-returns-type': 0
        }
    }
]