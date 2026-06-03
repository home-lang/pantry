import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/robscott/kube-capacity',
  name: 'kube-capacity',
  programs: [
    'kube-capacity',
  ],
  buildDependencies: {
    'go.dev': '~1.21',
  },
  distributable: {
    url: 'https://github.com/robscott/kube-capacity/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/"kube-capacity version v.*"/"kube-capacity version v{{version}}"/\' version.go',
        'working-directory': 'pkg/cmd',
      },
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/kube-capacity .',
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
      'test "$(kube-capacity version)" = "kube-capacity version v{{version}}"',
      'kube-capacity help',
      'kube-capacity completion bash',
    ],
  },
}
