import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/vhs',
  name: 'vhs',
  programs: [
    'vhs',
  ],
  dependencies: {
    'ffmpeg.org': '>=5',
    'tsl0922.github.io/ttyd': '^1.7.2',
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/vhs/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p {{ prefix }}/bin',
      'mv vhs {{ prefix }}/bin',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
