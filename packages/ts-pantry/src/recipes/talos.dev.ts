import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'talos.dev',
  name: 'talosctl',
  description: 'CLI for out-of-band management of Kubernetes nodes created by Talos',
  homepage: 'https://www.talos.dev/',
  github: 'https://github.com/siderolabs/talos',
  programs: ['talosctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'siderolabs/talos',
  },
  distributable: {
    url: 'https://github.com/siderolabs/talos/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/talosctl',
    ],
    env: {
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/talosctl'],
      'LDFLAGS': ['-s', '-w'],
    },
  },
}
