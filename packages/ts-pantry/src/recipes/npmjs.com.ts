import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/npmjs.com',
  domain: 'npmjs.com',
  name: 'npmjs',
  description: 'the package manager for JavaScript',
  homepage: 'https://docs.npmjs.com/cli/',
  github: 'https://github.com/npm/cli',
  programs: ['npm', 'npx'],
  versionSource: {
    type: 'github-releases',
    repo: 'npm/cli',
  },
  distributable: {
    url: 'https://github.com/npm/cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '*',
  },

  build: {
    script: [
      { run: 'ARGS="--install-links"', if: '^8 || >=9.4.2' },

      // 9.8.0 removed the references to these modules.
      {
        run: [
          'for MOD in ../workspaces/*; do',
          '  b=$(basename $MOD)',
          '  if test "${b#lib}" = "$b"; then',
          '    ln -s ../$MOD @npmcli/$b',
          '  else',
          '    ln -s $MOD .',
          '  fi',
          'done',
        ].join('\n'),
        'working-directory': 'node_modules',
        if: '>=9.8.0',
      },

      'node . install --global --prefix={{prefix}} $ARGS',

      // since January, npm warns on bad config names
      { run: 'sed -i \'s/update_notifier/update-notifier/\' props/npmrc', if: '>=11.2' },

      // configures npm to install to ~/.local
      'mv props/npmrc {{prefix}}/lib/node_modules/npm',

      // our shim fixes a bug where npx doesn't work if ~/.local/lib doesn't exist
      {
        run: [
          'rm npx',
          'mv $SRCROOT/props/npx-shim npx',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
  },
}
