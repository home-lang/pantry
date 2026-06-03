import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'operatorframework.io/operator-sdk',
  name: 'operator-sdk',
  programs: [
    'operator-sdk',
  ],
  dependencies: {
    'go.dev': '^1.19',
  },
  buildDependencies: {
    'cmake.org': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/operator-framework/operator-sdk',
  },
  build: {
    script: [
      'make build/operator-sdk',
      'mkdir -p {{ prefix }}/bin',
      'mv build/operator-sdk {{ prefix }}/bin',
    ],
  },
  test: {
    script: [
      'operator-sdk version | grep \'operator-sdk version: "v{{version}}"\'',
      'mkdir -p example-operator',
      'cd example-operator',
      'operator-sdk init --project-name example-operator --domain example.com --repo github.com/example/example-operator',
      'test -f main.go',
      'test -f cmd/main.go',
    ],
  },
}
