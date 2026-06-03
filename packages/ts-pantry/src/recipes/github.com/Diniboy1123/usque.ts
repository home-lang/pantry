import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Diniboy1123/usque',
  name: 'usque',
  programs: [
    'usque',
  ],
  buildDependencies: {
    'go.dev': '~1.24.2',
    'goreleaser.com': '*',
  },
  distributable: {
    url: 'git+https://github.com/Diniboy1123/usque',
  },
  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p {{ prefix }}/bin',
      'mv dist/{{hw.platform}}*/usque {{ prefix }}/bin',
    ],
    env: {
      CGO_ENABLED: 0,
    },
  },
}
