import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rubygems.org/gist',
  name: 'gist',
  programs: [
    'gist',
  ],
  dependencies: {
    'ruby-lang.org': '^3',
  },
  buildDependencies: {
    'rubygems.org': '*',
  },
  distributable: {
    url: 'https://github.com/defunkt/gist/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'rake install prefix={{prefix}}',
    ],
  },
}
