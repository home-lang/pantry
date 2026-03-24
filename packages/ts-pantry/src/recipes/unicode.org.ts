import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'unicode.org',
  name: 'unicode',
  description: 'The home of the ICU project source code.',
  homepage: 'https://icu.unicode.org/',
  github: 'https://github.com/unicode-org/icu',
  programs: ['derb', 'genbrk', 'gencfu', 'gencnval', 'gendict', 'genrb', 'icu-config', 'icuexportdata', 'icuinfo', 'makeconv', 'pkgdata', 'uconv'],
  versionSource: {
    type: 'github-releases',
    repo: 'unicode-org/icu',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/unicode-org/icu/releases/download/{{version.tag}}/icu4c-{{version.major}}.{{version.minor}}-sources.tgz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run:',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
  },
}
