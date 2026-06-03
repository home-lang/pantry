import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jesseduffield/lazygit',
  name: 'lazygit',
  programs: [
    'lazygit',
  ],
  dependencies: {
    'git-scm.org': '^2',
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/jesseduffield/lazygit/archive/refs/tags/v{{version}}.tar.gz',
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
