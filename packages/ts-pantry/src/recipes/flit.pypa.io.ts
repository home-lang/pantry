import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'flit.pypa.io',
  name: 'flit',
  description: 'Simplified packaging of Python modules',
  homepage: 'https://flit.pypa.io/',
  github: 'https://github.com/pypa/flit',
  programs: ['flit'],
  versionSource: {
    type: 'github-releases',
    repo: 'pypa/flit/tags',
  },
  distributable: {
    url: 'https://github.com/pypa/flit/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/flit',
    ],
  },
}
