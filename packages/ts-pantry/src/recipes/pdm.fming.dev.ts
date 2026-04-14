import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pdm.fming.dev',
  name: 'pdm',
  description: 'A modern Python package and dependency manager supporting the latest PEP standards',
  homepage: 'https://pdm.fming.dev',
  github: 'https://github.com/pdm-project/pdm',
  programs: ['pdm'],
  versionSource: {
    type: 'github-releases',
    repo: 'pdm-project/pdm',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/pdm-project/pdm/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/pdm',
    ],
  },
}
