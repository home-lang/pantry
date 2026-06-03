import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/str4d/age-plugin-yubikey',
  name: 'age-plugin-yubikey',
  programs: [
    'age-plugin-yubikey',
  ],
  dependencies: {
    linux: {
      'pcsclite.apdu.fr': '^2',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/str4d/age-plugin-yubikey/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# don\'t use --locked to prevent',
      '# error[E0635]: unknown feature `proc_macro_span_shrink`',
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(age-plugin-yubikey --version)" = "age-plugin-yubikey {{version}}"',
    ],
  },
}
