import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jesseduffield/lazydocker',
  name: 'lazydocker',
  programs: [
    'lazydocker',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/jesseduffield/lazydocker/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'GOBIN={{prefix}}/bin go install -ldflags="$LDFLAGS" .',
    ],
    env: {
      LDFLAGS: [
        '-X=main.version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
