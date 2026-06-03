import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/GoogleContainerTools/container-structure-test',
  name: 'container-structure-test',
  programs: [
    'container-structure-test',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
    'goreleaser.com': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/GoogleContainerTools/container-structure-test',
  },
  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p "{{ prefix }}"/bin',
      'mv "dist/container-structure-test-${GOOS}-${GOARCH}" "{{ prefix }}"/bin/container-structure-test',
    ],
    env: {
      CGO_ENABLED: 0,
      'darwin/aarch64': {
        PLATFORM: 'darwin_arm64',
        GOARCH: 'arm64',
        GOOS: 'darwin',
      },
      'darwin/x86-64': {
        PLATFORM: 'darwin_amd64_v1',
        GOARCH: 'amd64',
        GOOS: 'darwin',
      },
      'linux/aarch64': {
        PLATFORM: 'linux_arm64',
        GOARCH: 'arm64',
        GOOS: 'linux',
      },
      'linux/x86-64': {
        PLATFORM: 'linux_amd64_v1',
        GOARCH: 'amd64',
        GOOS: 'linux',
      },
    },
  },
  test: {
    script: [
      'test "$(container-structure-test version)" = "{{version}}"',
    ],
  },
}
