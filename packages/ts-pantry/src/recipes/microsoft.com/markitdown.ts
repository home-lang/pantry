import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/markitdown',
  name: 'markitdown',
  programs: [
    'markitdown',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },
  distributable: {
    url: 'https://github.com/microsoft/markitdown/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      // markitdown moved to a monorepo layout (v0.1.0+): the installable Python
      // package lives in packages/markitdown/. Early pre-release tags kept the
      // pyproject.toml at the repo root. Install from whichever path has it.
      'if [ -f packages/markitdown/pyproject.toml ]; then ${{prefix}}/venv/bin/pip install ./packages/markitdown; else ${{prefix}}/venv/bin/pip install .; fi',
      'bkpyvenv seal {{prefix}} markitdown',
    ],
  },
  test: {
    script: [
      'markitdown --help',
    ],
  },
}
