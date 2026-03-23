import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'hatch.pypa.io',
  name: 'hatch',
  description: 'Modern, extensible Python project management',
  homepage: 'https://hatch.pypa.io/latest/',
  github: 'https://github.com/pypa/hatch',
  programs: ['hatch'],
  versionSource: {
    type: 'github-releases',
    repo: 'pypa/hatch/releases/tags',
    tagPattern: /\/^hatch-v\//,
  },
  distributable: {
    url: 'https://github.com/pypa/hatch/archive/refs/tags/hatch-v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/hatch',
    ],
  },
}
