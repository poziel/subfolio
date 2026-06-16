import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', '.vite/**', 'node_modules/**', 'pocketbase/**']
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off'
    }
  }
]
