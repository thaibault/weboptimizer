import eslintjs from '@eslint/js';
import javascriptPlugin from '@stylistic/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import google from 'eslint-config-google';
import jsdoc from 'eslint-plugin-jsdoc';
import { readFile, stat } from 'fs/promises';
import globals from 'globals';
import { dirname, resolve } from 'path';
import { cwd } from 'process';
import typescript from 'typescript-eslint';
/**
 * Checks if given path points to a valid file.
 * @param filePath - Path to directory.
 * @returns A promise holding a boolean which indicates directory existence.
 */
export const isFile = async filePath => {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (Object.prototype.hasOwnProperty.call(error, 'code') && ['ENOENT', 'ENOTDIR'].includes(error.code)) return false;
    throw error;
  }
};

// Remove unsupported rules.
const UNSUPORTED_RULES = ['require-jsdoc', 'valid-jsdoc'];
const GOOGLE_RULES = Object.keys(google.rules).filter(key => !UNSUPORTED_RULES.includes(key)).reduce((object, key) => ({
  ...object,
  [key]: google.rules[key]
}), {});
const PACKAGE_CONFIGURATION = JSON.parse(await readFile(resolve(cwd(), './package.json'), {
  encoding: 'utf-8'
}));
const LIBRARY_INDICATOR = PACKAGE_CONFIGURATION.webOptimizer?.library;
const IS_LIBRARY = LIBRARY_INDICATOR ?? true;
let TSCONFIG_FILE_PATH = '';
for (const filePath of ['./tsconfig.json', './node_modules/weboptimizer/tsconfig.' + `${IS_LIBRARY ? 'library' : 'application'}.json`]) if (await isFile(filePath)) {
  TSCONFIG_FILE_PATH = filePath;
  break;
}
let PROJECT_SPECIFIG_CONFIGURATION = [];
if (PACKAGE_CONFIGURATION.name !== 'weboptimizer') try {
  // @ts-expect-error Need to create polomorphic type.
  const config = await import('../../eslint.config.mjs');
  const resolvedConfig = config.config ?? config.default ?? config.configuration ?? config;
  PROJECT_SPECIFIG_CONFIGURATION = PROJECT_SPECIFIG_CONFIGURATION.concat(resolvedConfig);
} catch {
  // Ignore regardless of an error.
}
export const config = typescript.config({
  extends: [eslintjs.configs.recommended, ...typescript.configs.strictTypeChecked, ...typescript.configs.strict, ...typescript.configs.stylistic, jsdoc.configs['flat/recommended']],
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
      project: TSCONFIG_FILE_PATH,
      tsconfigRootDir: dirname(TSCONFIG_FILE_PATH)
    },
    sourceType: 'module'
  },
  plugins: {
    jsdoc,
    '@stylistic': javascriptPlugin
  },
  rules: {
    ...GOOGLE_RULES,
    '@/no-implied-eval': 'error',
    '@stylistic/no-non-null-assertion': 'off',
    '@stylistic/type-annotation-spacing': 'error',
    '@typescript-eslint/array-type': ['error', {
      default: 'generic'
    }],
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/no-this-alias': ['error', {
      allowedNames: ['self']
    }],
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
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    '@typescript-eslint/no-unnecessary-type-parameters': 'off',
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
    camelcase: ['error', {
      properties: 'always'
    }],
    'comma-dangle': ['error', 'never'],
    curly: ['error', 'multi'],
    indent: ['error', 4, {
      ignoreComments: true
    }],
    'max-nested-callbacks': ['error', 10],
    'new-cap': 'off',
    'no-invalid-this': 'off',
    'no-unused-vars': ['off', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-constant-condition': 'off',
    'no-new-func': 'off',
    'no-new-wrappers': 'off',
    'quote-props': ['error', 'as-needed', {
      numbers: true
    }],
    semi: ['error', 'never'],
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      asyncArrow: 'always',
      named: 'never'
    }],
    'spaced-comment': ['error', 'always', {
      line: {
        exceptions: ['/usr/bin/env node']
      },
      markers: ['/', '//', '///']
    }],
    'space-infix-ops': 'off'
  }
},
// NOTE: Ignores has to be applied via a dedicated object to influence all
// given configuration objects.
{
  ignores: ['*.compiled.*', '*.js', '**/*.js', '**/.git/**/*', '**/.cache/**/*', '**/.config/**/*', '**/.npm/**/*', '**/log/**/*', '**/node_modules/**/*', '**/backup/**/*', '**/exclude/**/*', '**/*.d.ts', '!**/declarations.d.ts']
}, ...PROJECT_SPECIFIG_CONFIGURATION);
export default config;
