import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leo-lang.org',
  name: 'leo',
  description: '🦁 The Leo Programming Language. A Programming Language for Formally Verified, Zero-Knowledge Applications',
  homepage: 'https://leo-lang.org/',
  github: 'https://github.com/AleoHQ/leo',
  programs: ['leo'],
  versionSource: {
    type: 'github-releases',
    repo: 'AleoHQ/leo',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/AleoHQ/leo',
  },

  build: {
    script: [
      'git submodule update --init --recursive',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
