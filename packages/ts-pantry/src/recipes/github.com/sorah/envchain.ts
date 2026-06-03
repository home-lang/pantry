import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/sorah/envchain',
  name: 'envchain',
  programs: [
    'envchain',
  ],
  dependencies: {
    linux: {
      'gnu.org/readline': '*',
      'gnome.org/libsecret': '*',
    },
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'llvm.org': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/sorah/envchain/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      DESTDIR: '{{prefix}}',
    },
  },
}
