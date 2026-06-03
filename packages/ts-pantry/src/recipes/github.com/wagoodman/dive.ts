import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/wagoodman/dive',
  name: 'dive',
  programs: [
    'dive',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
    'goreleaser.com': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/wagoodman/dive',
  },
  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p "{{ prefix }}"/bin',
      'mv dist/dive_$PLATFORM/dive "{{ prefix }}"/bin',
    ],
    env: {
      CGO_ENABLED: 0,
      'darwin/aarch64': {
        PLATFORM: 'darwin_arm64_v8.0',
      },
      'darwin/x86-64': {
        PLATFORM: 'darwin_amd64_v1',
      },
      'linux/aarch64': {
        PLATFORM: 'linux_arm64_v8.0',
      },
      'linux/x86-64': {
        PLATFORM: 'linux_amd64_v1',
      },
    },
  },
  test: {
    script: [
      'test "$(dive --version)" = "dive {{version}}"',
    ],
  },
}
