import eslintjs from '@eslint/js'
import typescriptPlugin from '@stylistic/eslint-plugin-ts'
import typescriptParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'
import google from 'eslint-config-google'
import jsdoc from 'eslint-plugin-jsdoc'
import {readFile, stat} from 'fs/promises'
import globals from 'globals'
import {resolve} from 'path'
import {cwd} from 'process'
import typescript from 'typescript-eslint'

import {ResolvedConfiguration} from './type'
/**
 * Checks if given path points to a valid file.
 * @param filePath - Path to directory.
 * @returns A promise holding a boolean which indicates directory existence.
 */
export const isFile = async (filePath:string):Promise<boolean> => {
    try {
        return (await stat(filePath)).isFile()
    } catch (error) {
        if (
            Object.prototype.hasOwnProperty.call(error, 'code') &&
            ['ENOENT', 'ENOTDIR'].includes(
                (error as NodeJS.ErrnoException).code as string
            )
        )
            return false

        throw error
    }
}

// Remove unsupported rules.
const unsuportedRules = ['require-jsdoc', 'valid-jsdoc']
const googleRules = Object.keys((google as Mapping<object>).rules)
    .filter((key) => !unsuportedRules.includes(key))
    .reduce(
        (object, key) =>
            ({...object, [key]: (google as Mapping<Mapping>).rules[key]}),
        {}
    )

const libraryIndicator = (JSON.parse(
    await readFile(resolve(cwd(), './package.json'), {encoding: 'utf-8'})
) as {webOptimizer?:ResolvedConfiguration}).webOptimizer?.library
const isLibrary = libraryIndicator ?? true

let tsConfigFilePath = ''
for (const filePath of [
    './tsconfig.json',

    './node_modules/weboptimizer/tsconfig.' +
    `${isLibrary ? 'library' : 'application'}.json`
])
    if (await isFile(filePath)) {
        tsConfigFilePath = filePath
        break
    }

export const config = tseslint.config(
    {
        extends: [
            eslintjs.configs.recommended,
            ...typescript.configs.strictTypeChecked,
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic,
            jsdoc.configs['flat/recommended']
        ],
        files: ['**/*.{ts,tsx,html}'],
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
                project: tsConfigFilePath
            },
            sourceType: 'module'
        },
        ignores: [
            '*.compiled.*',
            '*.js',
            '**/*.js',
            '**/.git/**/*',
            '**/.cache/**/*',
            '**/.config/**/*',
            '**/.npm/**/*',
            '**/log/**/*',
            '**/node_modules/**/*',
            '**/backup/**/*',
            '**/exclude/**/*'
            /*
            ,
            '** /plugins/** /*',
            '*.d.ts',
            '** /*.d.ts'
             */
        ],
        plugins: {
            jsdoc,
            '@stylistic': typescriptPlugin
        },

        rules: {
            ...googleRules,

            '@/no-implied-eval': 'error',

            '@stylistic/no-non-null-assertion': 'off',
            '@stylistic/type-annotation-spacing': [
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

            '@typescript-eslint/array-type': ['error', {default: 'generic'}],
            '@typescript-eslint/no-dynamic-delete': 'off',
            '@typescript-eslint/no-this-alias': [
                'error', {allowedNames: ['self']}
            ],
            '@typescript-eslint/no-unused-vars': ['error', {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                caughtErrors: 'all',
                caughtErrorsIgnorePattern: '^_',
                ignoreRestSiblings: false,
                reportUsedIgnorePattern: false
            }],
            // NOTE: Too strcit for now but could be actvated in future maybe.
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',

            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/require-description-complete-sentence': 'error',
            'jsdoc/require-hyphen-before-param-description': 'error',
            'jsdoc/require-param': 'error',
            'jsdoc/require-param-description': 'error',
            'jsdoc/require-param-type': 'off',
            'jsdoc/require-property-type': 'off',
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

            semi: ['error', 'never'],

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
)

export default config
