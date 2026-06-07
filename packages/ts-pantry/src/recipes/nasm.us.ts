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
      // https://github.com/netwide-assembler/nasm/commit/dc247c9f9913e336200ecf8bb72152fdabdb3585#r167178007
      { run: 'sed -i \'s/l32toh(/le32toh(/g\' bytesex.h', 'working-directory': 'include' },
      './configure --prefix={{prefix}}',
      // rdoff tools removed as unfixable in 2.16
      // https://github.com/netwide-assembler/nasm/commit/93548c2de2a3c218b3d0ab4061b26d9781cb6b37
      {
        run: [
          'make --jobs {{hw.concurrency}} rdf',
          'make install install_rdf',
        ],
        if: '<2.16',
      },
      {
        run: [
          'make --jobs {{hw.concurrency}}',
          'make install',
        ],
        if: '>=2.16',
      },
    ],
  },
}
