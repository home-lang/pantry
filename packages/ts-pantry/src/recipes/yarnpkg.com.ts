import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'yarnpkg.com',
  name: 'yarn',
  description: '📦🐈 Active development trunk for Yarn ⚒',
  homepage: 'https://yarnpkg.com/',
  github: 'https://github.com/yarnpkg/berry',
  programs: ['yarn', 'yarnpkg'],
  versionSource: {
    type: 'github-releases',
    repo: 'yarnpkg/berry',
  },
  distributable: {
    url: 'https://github.com/yarnpkg/berry/archive/refs/tags/@yarnpkg/cli/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'classic.yarnpkg.com': '^1',
    'nodejs.org': '>=18.3<23',
  },

  build: {
    script: [
      'yarn install --immutable --mode=skip-build',
      'yarn build:cli',
      'cd "packages/yarnpkg-cli/bundles"',
      'chmod +x yarn.js',
      'mkdir -p {{prefix}}/bin',
      'cp yarn.js {{prefix}}/bin/yarn',
      '',
      'cd "${{prefix}}/bin"',
      'ln -s yarn yarnpkg',
    ],
  },
}
