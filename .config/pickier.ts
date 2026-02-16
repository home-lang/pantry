import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.zig-cache/**',
    '**/zig-out/**',
    '**/pantry/**',
    '**/*.generated.zig',
    '**/no/**',
    'CHANGELOG.md',
  ],

  lint: {
    extensions: ['ts', 'js'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },

  format: {
    extensions: ['ts', 'js', 'json', 'md', 'yaml', 'yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',
    indent: 2,
    quotes: 'single',
    semi: false,
  },

  rules: {
    noDebugger: 'error',
    noConsole: 'off',
  },

  pluginRules: {
    // Markdown rules
    'markdown/heading-increment': 'warn',
    'markdown/no-trailing-spaces': 'error',
    'markdown/fenced-code-language': 'warn',
    'markdown/no-duplicate-heading': 'off',
    'markdown/no-inline-html': 'off',
    'markdown/no-bare-urls': 'off',
    'markdown/link-image-style': 'off',
    'markdown/reference-links-images': 'off',
    'markdown/link-fragments': 'off',

    // Disable overly strict rules
    'regexp/no-unused-capturing-group': 'off',
    'ts/no-top-level-await': 'off',
    'style/brace-style': 'off',
  },
}

export default config
