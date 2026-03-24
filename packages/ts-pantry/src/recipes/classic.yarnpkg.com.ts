import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'classic.yarnpkg.com',
  name: 'classic.yarnpkg',
  description: 'The 1.x line is frozen - features and bugfixes now happen on https://github.com/yarnpkg/berry',
  homepage: 'https://yarnpkg.com/',
  github: 'https://github.com/yarnpkg/yarn',
  programs: ['yarn', 'yarnpkg'],
  versionSource: {
    type: 'github-releases',
    repo: 'yarnpkg/yarn',
  },
  distributable: {
    url: 'https://yarnpkg.com/downloads/{{ version }}/yarn-v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '>=5',
  },
  buildDependencies: {
    'npmjs.com': '*',
    'gnu.org/patch': '*',
  },

  build: {
    script: [
      'patch -p1 < props/global-prefix.patch',
      'npm install . --global --prefix={{prefix}} --install-links',
    ],
  },
}
