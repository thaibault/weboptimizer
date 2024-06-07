import globals from 'globals'
import google from 'eslint-config-google'
import jsdoc from 'eslint-plugin-jsdoc'
import js from '@eslint/js'
import typescript from 'typescript-eslint'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

// Remove unsupported rules.
const unsuportedRules = ['require-jsdoc', 'valid-jsdoc']
const googleRules = Object.keys(google.rules)
    .filter((key) => !unsuportedRules.includes(key))
    .reduce(
        (object, key) => ({
            ...object,
            [key]: google.rules[key]
        }),
        {}
    )

export default [
    js.configs.recommended,
    ...typescript.configs.recommended,
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
                project: './tsconfig.json'
            },
            sourceType: 'module'
        },
        ignores: [
            '**/exclude/*',
            '*.compiled.*',
            '*.d.ts',
            '**/*.d.ts',
            '*.js',
            '**/*.js'
        ],
        plugins: {
            jsdoc,
            '@typescript-eslint': typescriptPlugin
        },

        rules: {
            ...googleRules,
            ...typescriptPlugin.configs.recommended.rules,

            '@typescript-eslint/no-implied-eval': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-this-alias': [
                'error',
                {allowedNames: ['self']}
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
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

            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/require-description-complete-sentence': 'error',
            'jsdoc/require-hyphen-before-param-description': 'error',
            'jsdoc/require-param': 'error',
            'jsdoc/require-param-description': 'error',
            'jsdoc/require-param-type': 'off',
            'jsdoc/require-returns-description': 'error',
            'jsdoc/require-returns-type': 'off',
            'jsdoc/tag-lines': ['error', 'never'],

            'arrow-parens': ['error', 'always'],
            'block-scoped-var': 'off',
            camelcase: ['error', {properties: 'always'}],
            'comma-dangle': ['error', 'never'],
            curly: ['error', 'multi'],
            indent: ['error', 4, {ignoreComments: true}],
            'max-nested-callbacks': ['error', 10],

            'new-cap': 'off',

            'no-invalid-this': 'off',
            'no-unused-vars': [
                'off',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            'no-constant-condition': 'off',
            'no-new-func': 'off',
            'no-new-wrappers': 'off',

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
            'space-infix-ops': 'off'
        }
    }
]
