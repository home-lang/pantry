import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/junegunn/fzf',
  name: 'fzf',
  programs: [
    'fzf',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/junegunn/fzf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p {{ prefix }}/bin',
      'mv fzf {{ prefix }}/bin',
      'cp bin/fzf-tmux {{ prefix }}/bin',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{ version }}',
        '-X main.revision=tea',
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
      'out=$(cat data.txt | fzf -f wld)',
      'test "$out" = "world"',
    ],
  },
}
