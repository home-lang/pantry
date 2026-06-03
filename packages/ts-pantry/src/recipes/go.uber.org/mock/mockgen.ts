import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'go.uber.org/mock/mockgen',
  name: 'mockgen',
  programs: [
    'mockgen',
  ],
  dependencies: {
    'go.dev': '^1.20',
  },
  buildDependencies: {
    'goreleaser.com': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/uber-go/mock',
  },
  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p "{{ prefix }}"/bin',
      'mv dist/mock_$PLATFORM/mockgen "{{ prefix }}"/bin',
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
      'mockgen --version | grep "v{{version}}"',
      'mockgen -source=foo.go -destination=foo_mock.go',
      'test -f foo_mock.go',
    ],
  },
}
