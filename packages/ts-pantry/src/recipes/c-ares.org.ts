import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'c-ares.org',
  name: 'c-ares',
  description: '',
  programs: ['c-ares'],
  distributable: {
    url: 'https://c-ares.org/download/c-ares-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: curl -O https://opensource.apple.com/source/configd/configd-1109.140.1/dnsinfo/dnsinfo.h',
      'cmake .. -DCMAKE_INSTALL_PREFIX="{{prefix}}" -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
