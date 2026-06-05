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
    // Pin the git checkout to the release tag. Without it the shallow clone
    // builds from default-branch HEAD (untagged), so `goreleaser build` fails
    // with "git doesn't contain any tags". GORELEASER_CURRENT_TAG injects the
    // version into the build the same way pkgx does.
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  build: {
    script: [
      'GORELEASER_CURRENT_TAG="v{{version}}" goreleaser build --clean --single-target --skip=validate',
      'install -Dm755 dist/$PLATFORM/snipkit "{{prefix}}"/bin/snipkit',
    ],
    env: {
      CGO_ENABLED: '0',
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
