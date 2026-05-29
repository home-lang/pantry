import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tox.wiki',
  name: 'tox',
  description: 'Command line driven CI frontend and development task automation tool.',
  homepage: 'https://tox.wiki/en/latest/',
  github: 'https://github.com/tox-dev/tox',
  programs: ['tox'],
  versionSource: {
    type: 'github-releases',
    repo: 'tox-dev/tox',
  },
  distributable: {
    url: 'https://github.com/tox-dev/tox/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.7',
    // tox uses hatch-vcs (version.source = "vcs"); the buildkit shim does
    // `git init` + tag v{{version}} so hatchling can resolve the version,
    // which requires git to be present (mirrors the pytest.org sibling).
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} tox',
    ],
  },
}
