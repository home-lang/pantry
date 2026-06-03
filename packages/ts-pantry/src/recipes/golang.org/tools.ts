import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'golang.org/tools',
  name: 'tools',
  programs: [
    'goimports',
    'callgraph',
    'digraph',
    'stringer',
    'toolstash',
  ],
  buildDependencies: {
    'go.dev': '~1.25',
  },
  distributable: {
    url: 'https://github.com/golang/tools/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/goimports ./cmd/goimports',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/callgraph ./cmd/callgraph',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/digraph ./cmd/digraph',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/stringer ./cmd/stringer',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/toolstash ./cmd/toolstash',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'goimports -d $FIXTURE | tee out',
      'grep \'+import "fmt"\' out',
      'callgraph $FIXTURE | tee out',
      'grep "fmt.Println" out',
      'cp $FIXTURE clothes.txt',
      'cat clothes.txt | digraph reverse jacket | tee out',
      'test "$(cat out)" = "$(cat $FIXTURE)"',
      'cp $FIXTURE pill.go',
      'go mod init pilltest',
      'stringer -type=Pill',
      'grep "func (. Pill) String() string" pill_string.go',
      'toolstash save',
      'toolstash restore',
      'toolstash go run $FIXTURE | tee out',
      'test "$(cat out)" = "toolstash test"',
    ],
  },
}
