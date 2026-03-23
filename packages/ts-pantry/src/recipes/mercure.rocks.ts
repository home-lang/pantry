import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
      'goreleaser build --clean --single-target --skip=validate',
      'mkdir -p "{{ prefix }}"/bin',
      'mv dist/caddy_{{hw.platform}}_$ARCH/mercure "{{ prefix }}"/bin',
    ],
    env: {
      'CGO_ENABLED': '0',
    },
  },
}
