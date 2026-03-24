import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'boost.org',
  name: 'boost',
  description: 'Super-project for modularized Boost',
  homepage: 'https://github.com/boostorg/wiki/wiki/Getting-Started%3A-Overview',
  github: 'https://github.com/boostorg/boost',
  programs: ['boost'],
  versionSource: {
    type: 'github-releases',
    repo: 'boostorg/boost',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://archives.boost.io/release/{{version}}/source/boost_{{version.major}}_{{version.minor}}_{{version.patch}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './bootstrap.sh --prefix={{ prefix }}',
      './b2 $ARGS',
      'run: |',
    ],
  },
}
