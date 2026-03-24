import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mun-lang.org',
  name: 'mun',
  description: 'Source code for the Mun language and runtime.',
  homepage: 'https://mun-lang.org',
  github: 'https://github.com/mun-lang/mun',
  programs: ['mun'],
  versionSource: {
    type: 'github-releases',
    repo: 'mun-lang/mun',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/mun-lang/mun/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for mun-lang.org"',    ],
  },
}
