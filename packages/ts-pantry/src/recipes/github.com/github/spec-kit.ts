import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/github/spec-kit',
  name: 'spec-kit',
  programs: [
    'specify',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },
  distributable: {
    url: 'https://github.com/github/spec-kit/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} specify',
    ],
  },
  test: {
    script: [
      'specify init test-project --ai copilot --script sh --ignore-agent-tools',
      'test -f test-project/.specify/memory/constitution.md',
    ],
  },
}
