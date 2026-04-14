import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libsodium.org',
  name: 'libsodium',
  programs: [],
  distributable: {
    url: 'https://download.libsodium.org/libsodium/releases/libsodium-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
  },
}
