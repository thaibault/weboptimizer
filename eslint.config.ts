export default {
    env: {
        browser: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'google'
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        impliedStrict: true,
        project: 'node_modules/weboptimizer/tsconfigLibrary.json',
        sourceType: 'module'
    },
    parser: '@typescript-eslint/parser',
    plugins: [
        'jsdoc',
        '@typescript-eslint'
    ],
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
        'no-invalid-this': 0,
        'no-unused-vars': [
            'error',
            {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }
        ],
        'new-cap': 0,
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
        'require-jsdoc': [
            'error',
            {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true
                }
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
        'valid-jsdoc': [
            0,
            {
                prefer: {
                    return: 'returns'
                },
                requireParamDescription: false,
                requireReturnDescription: true,
                requireReturnType: false
            }
        ],
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