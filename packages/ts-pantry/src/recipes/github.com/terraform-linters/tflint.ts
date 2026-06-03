import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/terraform-linters/tflint',
  name: 'tflint',
  programs: [
    'tflint',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/terraform-linters/tflint/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'export GOPATH="$PWD/build"',
      'mkdir -p dist',
      'go build -v -ldflags="$LDFLAGS" -o dist/tflint',
      'mkdir -p {{prefix}}/bin',
      'mv dist/tflint {{prefix}}/bin/',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
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
      '# tflint returns exitstatus: 0 (no issues), 2 (errors occured), 3 (no errors but issues found)',
      'test "" = "$(tflint test.tf)"',
      'tflint --version | grep {{version}}',
    ],
  },
}
