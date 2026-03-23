import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'sing-box.app',
  name: 'sing-box',
  description: 'The universal proxy platform',
  homepage: 'https://sing-box.sagernet.org',
  github: 'https://github.com/SagerNet/sing-box',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'SagerNet/sing-box',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/SagerNet/sing-box/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LDFLAGS" ./cmd/sing-box',
    ],
  },
}
