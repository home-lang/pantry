import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'flipt.io',
  name: 'flipt',
  description: 'Enterprise-ready, GitOps enabled, CloudNative feature management solution',
  homepage: 'https://flipt.io',
  github: 'https://github.com/flipt-io/flipt',
  programs: ['flipt'],
  versionSource: {
    type: 'github-releases',
    repo: 'flipt-io/flipt',
  },
  distributable: {
    url: 'https://github.com/flipt-io/flipt/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '1.22.0',
  },

  build: {
    script: [
      'go build -v -trimpath -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/flipt ./cmd/flipt',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
    skip: ['fix-machos'],
  },
}
