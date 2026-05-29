import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'oras.land',
  name: 'oras',
  description: 'OCI registry client - managing content like artifacts, images, packages',
  homepage: 'https://oras.land',
  github: 'https://github.com/oras-project/oras',
  programs: ['oras'],
  versionSource: {
    type: 'github-releases',
    repo: 'oras-project/oras',
  },
  distributable: {
    url: 'git+https://github.com/oras-project/oras',
  },
  buildDependencies: {
    'go.dev': '^1.19',
    'goreleaser.com': '*',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p {{prefix}}/bin',
      'mv dist/oras_$PLATFORM/oras {{prefix}}/bin',
    ],
    env: {
      'CGO_ENABLED': '0',
      'darwin/aarch64': { PLATFORM: 'darwin_arm64_v8.0' },
      'darwin/x86-64': { PLATFORM: 'darwin_amd64_v1' },
      'linux/aarch64': { PLATFORM: 'linux_arm64_v8.0' },
      'linux/x86-64': { PLATFORM: 'linux_amd64_v1' },
    },
  },
}
