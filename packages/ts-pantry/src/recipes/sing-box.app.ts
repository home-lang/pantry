import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sing-box.app',
  name: 'sing-box',
  description: 'The universal proxy platform',
  homepage: 'https://sing-box.sagernet.org',
  github: 'https://github.com/SagerNet/sing-box',
  programs: ['sing-box'],
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
      'go build $GO_ARGS -tags "with_gvisor,with_quic,with_dhcp,with_wireguard,with_utls,with_clash_api" -ldflags="$LDFLAGS" ./cmd/sing-box',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/sing-box',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/sagernet/sing-box/constant.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
