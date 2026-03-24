import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pygments.org',
  name: 'pygmentize',
  description: 'Pygments is a generic syntax highlighter written in Python',
  homepage: 'https://pygments.org/',
  github: 'https://github.com/pygments/pygments',
  programs: ['pygmentize'],
  versionSource: {
    type: 'github-releases',
    repo: 'pygments/pygments/tags',
  },
  distributable: {
    url: 'https://github.com/pygments/pygments/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/pygmentize',
      'cd "${{prefix}}/venv/lib/python3.11/site-packages"',
      'if [ -d Pygments ]; then',
      '  mv Pygments foo',
      '  mv foo pygments',
      'fi',
      '',
    ],
  },
}
