import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cruft.github.io',
  name: 'cruft',
  description: 'Allows you to maintain all the necessary cruft for packaging and building projects separate from the code you intentionally write. Built on-top of, and fully compatible with, CookieCutter.',
  homepage: 'https://cruft.github.io/cruft/',
  github: 'https://github.com/cruft/cruft',
  programs: ['cruft'],
  versionSource: {
    type: 'github-releases',
    repo: 'cruft/cruft',
  },
  distributable: {
    url: 'https://github.com/cruft/cruft/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.7<3.12',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/cruft',
      '',
    ],
  },
}
