import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opus-codec.org',
  name: 'opus-codec',
  description: 'Modern audio compression for the internet.',
  homepage: 'https://opus-codec.org/',
  github: 'https://github.com/xiph/opus',
  programs: ['opus-codec'],
  versionSource: {
    type: 'github-releases',
    repo: 'xiph/opus',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/xiph/opus/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
