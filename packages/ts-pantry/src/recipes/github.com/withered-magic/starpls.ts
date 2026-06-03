import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/withered-magic/starpls',
  name: 'starpls',
  programs: [
    'starpls',
  ],
  buildDependencies: {
    'github.com/bazelbuild/bazelisk': '*',
  },
  distributable: {
    url: 'https://github.com/withered-magic/starpls/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bazel build -c opt --experimental_convenience_symlinks=normal --action_env=BAZEL_DO_NOT_DETECT_CPP_TOOLCHAIN=1 //crates/starpls',
      'install -Dm755 bazel-bin/crates/starpls/starpls {{prefix}}/bin/starpls',
    ],
  },
  test: {
    script: [
      'starpls version | grep {{version}}',
      'touch MODULE.bazel',
      'cp $FIXTURE test.bzl',
      'starpls check test.bzl',
      'echo "invalid" >> test.bzl',
      '! starpls check test.bzl',
      '(starpls check test.bzl 2>&1 || true) | grep "test.bzl:3"',
    ],
  },
}
