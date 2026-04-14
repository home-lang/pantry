import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getzola.org',
  name: 'zola',
  description: 'A fast static site generator in a single binary with everything built-in. https://www.getzola.org',
  homepage: 'https://www.getzola.org/',
  github: 'https://github.com/getzola/zola',
  programs: ['zola'],
  versionSource: {
    type: 'github-releases',
    repo: 'getzola/zola',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/getzola/zola/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
