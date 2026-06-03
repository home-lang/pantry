import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/bazelbuild/bazelisk',
  name: 'bazelisk',
  programs: [
    'bazel',
    'bazelisk',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/bazelbuild/bazelisk/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -ldflags "$LDFLAGS" -o {{prefix}}/bin/bazelisk',
      'ln -s bazelisk {{prefix}}/bin/bazel',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X=github.com/bazelbuild/bazelisk/main.BazeliskVersion=v{{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
