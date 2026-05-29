import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mercure.rocks',
  name: 'mercure',
  description: '🪽 An open, easy, fast, reliable and battery-efficient solution for real-time communications',
  homepage: 'https://mercure.rocks',
  github: 'https://github.com/dunglas/mercure',
  programs: ['mercure'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'dunglas/mercure',
  },
  distributable: {
    url: 'git+https://github.com/dunglas/mercure',
  },
  buildDependencies: {
    'go.dev': '^1.19',
    'goreleaser.com': '>=2.4.2',
    'git-scm.org': '*',
  },

  build: {
    script: [
      // The loader does not forward distributable.ref, so the git+ url clones
      // the default branch. Check out the requested release tag so goreleaser
      // builds {{version}} (it reads the version from the git tag).
      'git fetch --depth 1 origin "tag" "v{{version}}" 2>/dev/null || git fetch origin "tag" "v{{version}}" || true',
      'git checkout "v{{version}}" 2>/dev/null || true',
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p "{{prefix}}"/bin',
      'mv dist/caddy_{{hw.platform}}_$ARCH/mercure "{{prefix}}"/bin',
    ],
    env: {
      'CGO_ENABLED': '0',
      'aarch64': { ARCH: 'arm64_v8.0' },
      'x86-64': { ARCH: 'amd64_v1' },
    },
  },
}
