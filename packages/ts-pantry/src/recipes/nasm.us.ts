import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nasm.us',
  name: 'nasm.us',
  description: 'A cross-platform x86 assembler with an Intel-like syntax',
  homepage: 'https://www.nasm.us/',
  github: 'https://github.com/netwide-assembler/nasm',
  programs: ['nasm', 'ndisasm'],
  versionSource: {
    type: 'github-releases',
    repo: 'netwide-assembler/nasm',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.nasm.us/pub/nasm/releasebuilds/{{version.raw}}/nasm-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cd "include"',
      'sed -i \'s/l32toh(/le32toh(/g\' bytesex.h',
      './configure --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}} rdf',
      'make install install_rdf',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
