import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sympy.org',
  name: 'sympy',
  description: 'A computer algebra system written in pure Python',
  homepage: 'https://sympy.org/',
  github: 'https://github.com/sympy/sympy',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'sympy/sympy',
    tagPattern: /\/^sympy-\//,
  },
  distributable: {
    url: 'git+https://github.com/sympy/sympy.git',
  },
  dependencies: {
    'python.org': '>=3.11',
  },

  build: {
    script: [
      'cd "sympy"',
      'sed -i \'s/__version__ =.*/__version__ = "{{version.raw}}"/\' release.py',
      'python -m pip install --prefix={{prefix}} .',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
    ],
  },
}
