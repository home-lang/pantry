import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'keephq.dev',
  name: 'keep',
  description: 'The open-source AIOps and alert management platform',
  homepage: 'https://keephq.dev',
  github: 'https://github.com/keephq/keep',
  programs: ['keep'],
  versionSource: {
    type: 'github-releases',
    repo: 'keephq/keep',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/keephq/keep/archive/refs/heads/main.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/keep',
    ],
  },
}
