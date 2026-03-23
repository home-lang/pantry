import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'xtls.github.io',
  name: 'xray-core',
  description: 'Xray, Penetrates Everything. Also the best v2ray-core, with XTLS support. Fully compatible configuration.',
  homepage: 'https://xtls.github.io/',
  github: 'https://github.com/XTLS/Xray-core',
  programs: ['xray'],
  versionSource: {
    type: 'github-releases',
    repo: 'XTLS/Xray-core',
  },
  distributable: {
    url: 'https://github.com/XTLS/Xray-core/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21.4',
    'curl.se': '*',
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS" ./main',
      'cd "${{prefix}}/share/xray"',
      'curl -L "$RES_GEOSITE" -o geosite.dat',
      'curl -L "$RES_GEOIP" -o geoip.dat',
      'cd "${{prefix}}/etc/xray"',
      'curl -L "$RES_CONFIG" -o config.json',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-buildid='],
      'GO_ARGS': ['-trimpath', '-o="{{prefix}}/bin/xray"'],
      'RES_GEOSITE': 'https://github.com/v2fly/domain-list-community/releases/download/20250916122507/dlc.dat',
      'RES_CONFIG': 'https://raw.githubusercontent.com/v2fly/v2ray-core/v5.40.0/release/config/config.json',
      'RES_GEOIP': 'https://github.com/v2fly/geoip/releases/download/202510050144/geoip.dat',
    },
  },
}
