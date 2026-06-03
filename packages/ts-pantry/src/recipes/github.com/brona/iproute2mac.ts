import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/brona/iproute2mac',
  name: 'iproute2mac',
  programs: [
    'bridge',
    'ip',
    'iproute2mac.py',
  ],
  dependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'https://github.com/brona/iproute2mac/releases/download/{{version.tag}}/iproute2mac-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'install -D src/ip.py {{prefix}}/bin/ip',
      'install -D src/iproute2mac.py {{prefix}}/bin/iproute2mac.py',
      'install -D src/bridge.py {{prefix}}/bin/bridge',
    ],
  },
  test: {
    script: [
      'ip route',
      'ip link',
      'ip -V | grep {{version}}',
    ],
  },
}
