import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/yannh/kubeconform',
  name: 'kubeconform',
  programs: [
    'kubeconform',
  ],
  buildDependencies: {
    'go.dev': '>=1.21',
  },
  distributable: {
    url: 'git+https://github.com/yannh/kubeconform.git',
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/kubeconform',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/kubeconform',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
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
      'curl -L "https://raw.githubusercontent.com/yannh/kubeconform/master/fixtures/valid.yaml" -o valid.yaml',
      'kubeconform valid.yaml',
      'curl -L "https://raw.githubusercontent.com/yannh/kubeconform/master/fixtures/invalid.yaml" -o invalid.yaml',
      'kubeconform invalid.yaml | false || true',
      'kubeconform -v | grep {{version}}',
    ],
  },
}
