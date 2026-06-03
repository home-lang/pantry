import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lemoony/snipkit',
  name: 'snipkit',
  programs: [
    'snipkit',
  ],
  buildDependencies: {
    'go.dev': '^1.26',
    'goreleaser.com': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/lemoony/snipkit',
  },
  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'install -Dm755 dist/$PLATFORM/snipkit "{{prefix}}"/bin/snipkit',
    ],
    env: {
      CGO_ENABLED: 0,
      'darwin/aarch64': {
        PLATFORM: 'macos_darwin_arm64_v8.0',
      },
      'darwin/x86-64': {
        PLATFORM: 'macos_darwin_amd64_v1',
      },
      'linux/aarch64': {
        PLATFORM: 'linux_linux_arm64_v8.0',
      },
      'linux/x86-64': {
        PLATFORM: 'linux_linux_amd64_v1',
      },
    },
  },
  test: {
    script: [
      'snipkit --version | grep {{version}}',
      'snipkit --help',
    ],
  },
}
