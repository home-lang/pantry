import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'filippo.io/yubikey-agent',
  name: 'yubikey-agent',
  programs: [
    'yubikey-agent',
  ],
  dependencies: {
    'pcsclite.apdu.fr': '^2',
    linux: {
      'gnupg.org/pinentry': '*',
    },
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/FiloSottile/yubikey-agent/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -ldflags "$LDFLAGS" -o "{{prefix}}"/bin/yubikey-agent',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X=filippo.io/yubikey-agent/main.Version=v{{ version }}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'yubikey-agent -l ./yubikey-agent.sock &',
      'sleep 1',
      'test -S ./yubikey-agent.sock',
      '$KILL yubikey-agent',
    ],
  },
}
