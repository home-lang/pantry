import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jedisct1.github.io/minisign',
  name: 'minisign',
  programs: [
    'minisign',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'libsodium.org': '*',
  },
  distributable: {
    url: 'https://github.com/jedisct1/minisign/archive/refs/tags/{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -D BUILD_STATIC_EXECUTABLES=1 .',
      'make',
      'mkdir -p {{ prefix }}/bin',
      'mv minisign {{ prefix }}/bin',
    ],
  },
  test: {
    script: [
      'minisign -v',
    ],
  },
}
