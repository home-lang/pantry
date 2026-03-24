import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libexpat.github.io',
  name: 'xmlwf',
  description: ':herb: Fast streaming XML parser written in C99 with >90% test coverage; moved from SourceForge to GitHub',
  homepage: 'https://libexpat.github.io/',
  github: 'https://github.com/libexpat/libexpat',
  programs: ['xmlwf'],
  versionSource: {
    type: 'github-releases',
    repo: 'libexpat/libexpat/releases',
  },
  distributable: {
    url: 'https://github.com/libexpat/libexpat/releases/download/R_{{ version.major }}_{{ version.minor }}_{{ version.patch }}/expat-{{ version }}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
      'cd "${{ prefix }}/lib"',
      'rm *.la',
    ],
  },
}
