import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'opentofu.org',
  name: 'tofu',
  description: 'OpenTofu lets you declaratively manage your cloud infrastructure.',
  homepage: 'https://opentofu.org',
  github: 'https://github.com/opentofu/opentofu',
  programs: ['tofu'],
  versionSource: {
    type: 'github-releases',
    repo: 'opentofu/opentofu',
  },
  distributable: {
    url: 'https://github.com/opentofu/opentofu/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'go build -o "{{prefix}}/bin/" -ldflags="$GO_LDFLAGS" ./cmd/tofu',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/opentofu/opentofu/version.dev=no'],
    },
  },
}
