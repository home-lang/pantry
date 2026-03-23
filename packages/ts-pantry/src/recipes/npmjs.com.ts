import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'npmjs.com',
  name: 'npmjs',
  description: 'the package manager for JavaScript',
  homepage: 'https://docs.npmjs.com/cli/',
  github: 'https://github.com/npm/cli',
  programs: ['npm', 'npx'],
  versionSource: {
    type: 'github-releases',
    repo: 'npm/cli/tags',
  },
  distributable: {
    url: 'https://github.com/npm/cli/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '*',
  },

  build: {
    script: [
      'ARGS="--install-links"',
      'cd "node_modules"',
      'for MOD in ../workspaces/*; do',
      '  b=$(basename $MOD)',
      '  if test "${b#lib}" = "$b"; then',
      '    ln -s ../$MOD @npmcli/$b',
      '  else',
      '    ln -s $MOD .',
      '  fi',
      'done',
      '',
      'node . install --global --prefix={{prefix}} $ARGS',
      'sed -i \'s/update_notifier/update-notifier/\' props/npmrc',
      'mv props/npmrc {{prefix}}/lib/node_modules/npm',
      'cd "${{prefix}}/bin"',
      'rm npx',
      'mv $SRCROOT/props/npx-shim npx',
    ],
  },
}
