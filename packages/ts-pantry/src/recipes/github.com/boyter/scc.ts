import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/boyter/scc',
  name: 'scc',
  programs: [
    'scc',
  ],
  buildDependencies: {
    'go.dev': '^1.14',
  },
  distributable: {
    url: 'https://github.com/boyter/scc/archive/refs/tags/v{{version}}.tar.gz',
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
