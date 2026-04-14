import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pokt.network',
  name: 'pocket',
  description: 'Official implementation of the Pocket Network Protocol',
  homepage: 'http://www.pokt.network',
  github: 'https://github.com/pokt-network/pocket-core',
  programs: ['pocket'],
  versionSource: {
    type: 'github-releases',
    repo: 'pokt-network/pocket-core',
    tagPattern: /^RC-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/pokt-network/pocket-core/archive/refs/tags/RC-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'cd "app"',
      'sed -i -e \'s/AppVersion = ".*"$/AppVersion = "RC-{{version}}"/\' app.go',
      'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}\'/bin/pocket ./app/cmd/pocket_core/main.go',
    ],
  },
}
