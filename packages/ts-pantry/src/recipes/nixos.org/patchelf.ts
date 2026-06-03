import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nixos.org/patchelf',
  name: 'patchelf',
  programs: [
    'patchelf',
  ],
  distributable: {
    url: 'https://github.com/NixOS/patchelf/releases/download/{{version}}/patchelf-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
