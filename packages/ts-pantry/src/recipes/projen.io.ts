import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'projen.io',
  name: 'projen',
  description: 'Rapidly build modern applications with advanced configuration management',
  homepage: 'https://projen.io',
  github: 'https://github.com/projen/projen',
  programs: ['projen'],
  versionSource: {
    type: 'github-releases',
    repo: 'projen/projen',
  },
  distributable: {
    url: 'https://github.com/projen/projen/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^20 || ^18',
  },
  buildDependencies: {
    'classic.yarnpkg.com': '^1',
    'npmjs.com': '~11.4.2',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}"/bin',
      'yarn version --new-version {{version.raw}} --no-git-tag-version',
      'yarn install --check-files --frozen-lockfile',
      'npx jsii --silence-warnings=reserved-word && npx jsii-pacmak --targets js',
      'tar xfz dist/js/*.tgz -C {{prefix}}',
      'cp -R node_modules/constructs "{{prefix}}"/package/node_modules',
      'cd "${{prefix}}/bin"',
      'ln -s ../package/bin/projen projen',
    ],
  },
}
