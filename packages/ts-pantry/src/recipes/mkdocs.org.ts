import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mkdocs.org',
  name: 'mkdocs',
  description: 'Project documentation with Markdown.',
  homepage: 'https://www.mkdocs.org',
  github: 'https://github.com/mkdocs/mkdocs',
  programs: ['mkdocs'],
  versionSource: {
    type: 'github-releases',
    repo: 'mkdocs/mkdocs',
  },
  distributable: {
    url: 'https://github.com/mkdocs/mkdocs/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python3 -m pip install --break-system-packages setuptools hatchling hatch-requirements-txt "wheel<1" 2>/dev/null || pip3 install --break-system-packages setuptools hatchling hatch-requirements-txt "wheel<1" 2>/dev/null || true',
      'python-venv.sh {{prefix}}/bin/mkdocs',
    ],
    env: {
      'PIP_NO_BUILD_ISOLATION': '1',
    },
  },
}
