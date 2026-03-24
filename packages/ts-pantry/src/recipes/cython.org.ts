import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cython.org',
  name: 'cython',
  description: 'Compiler for writing C extensions for the Python language',
  homepage: 'https://cython.org/',
  github: 'https://github.com/cython/cython',
  programs: ['cython'],
  versionSource: {
    type: 'github-releases',
    repo: 'cython/cython/releases',
  },
  distributable: {
    url: 'https://github.com/cython/cython/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '<3.12',
  },
  buildDependencies: {
    'pip.pypa.io': '*',
  },

  build: {
    script: [
      'python-venv.py {{prefix}}/bin/cython',
    ],
  },
}
