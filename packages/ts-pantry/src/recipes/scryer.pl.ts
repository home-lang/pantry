import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'scryer.pl',
  name: 'Scryer Prolog',
  description: 'Modern ISO Prolog implementation written mostly in Rust',
  homepage: 'https://www.scryer.pl',
  github: 'https://github.com/mthom/scryer-prolog',
  programs: ['scryer-prolog'],
  versionSource: {
    type: 'github-releases',
    repo: 'mthom/scryer-prolog',
  },
  distributable: {
    url: 'https://github.com/mthom/scryer-prolog/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.85',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path . --root \'{{prefix}}\'',
    ],
  },
}
