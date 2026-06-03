import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/aswinkarthik/csvdiff',
  name: 'csvdiff',
  programs: [
    'csvdiff',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/aswinkarthik/csvdiff/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags "$LDFLAGS" -o csvdiff main.go',
      'mkdir -p "{{ prefix }}"/bin',
      'mv csvdiff "{{ prefix }}"/bin',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(csvdiff file1.csv file2.csv --format rowmark)" = "$(cat $FIXTURE)"',
    ],
  },
}
