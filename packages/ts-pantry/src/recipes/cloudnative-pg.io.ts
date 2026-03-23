import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cloudnative-pg.io',
  name: 'kubectl-cnpg',
  description: 'CloudNativePG is a comprehensive platform designed to seamlessly manage PostgreSQL databases within Kubernetes environments, covering the entire operational lifecycle from initial deployment to ongoing maintenance',
  homepage: 'https://cloudnative-pg.io/',
  github: 'https://github.com/cloudnative-pg/cloudnative-pg',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'cloudnative-pg/cloudnative-pg',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/cloudnative-pg/cloudnative-pg/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \\'{{prefix}}/bin/kubectl-cnpg\\' ./cmd/kubectl-cnpg/main.go',
    ],
  },
}
