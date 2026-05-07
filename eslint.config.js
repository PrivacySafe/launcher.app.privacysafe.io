import eslintJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import pluginVue from 'eslint-plugin-vue';
import configPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      './src/env.d.ts',
      './@types/**/*.*',
      './app/**/*.*',
      './ci/**/*.*',
      './doc/**/*.*',
      './public/**/*.*',
      './src/**/*.js',
      './src-system-map/**/*.js',
      'push-to-github.sh',
    ],
  },

  eslintJs.configs['recommended'],
  ...tsEslint.configs.strict,
  ...tsEslint.configs.stylistic,
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
      'no-undef': 'off',
      'default-case': ['error'],
      curly: 'error',

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-inferrable-types': ['error', { ignoreProperties: false, ignoreParameters: false }],
      '@typescript-eslint/naming-convention': ['error', { selector: 'interface', format: ['PascalCase'] }],
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      '@typescript-eslint/prefer-function-type': 'off',
    },
  },

  ...pluginVue.configs['flat/base'],
  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsEslint.parser,
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unsafe-optional-chaining': ['error'],
      'vue/no-v-model-argument': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-duplicate-attributes': ['error', { allowCoexistClass: true, allowCoexistStyle: true }],

      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreProperties: false,
          ignoreParameters: false,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      '@typescript-eslint/prefer-function-type': 'off',
      '@typescript-eslint/unified-signatures': 'off',
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  configPrettier,
];
