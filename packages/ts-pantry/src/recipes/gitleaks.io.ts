import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'gitleaks.io',
  name: 'gitleaks',
  description: 'Find secrets with Gitleaks 🔑',
  homepage: 'https://gitleaks.io',
  github: 'https://github.com/gitleaks/gitleaks',
  programs: ['gitleaks'],
  versionSource: {
    type: 'github-releases',
    repo: 'zricethezav/gitleaks',
  },
  distributable: {
    url: 'https://github.com/zricethezav/gitleaks/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      'LDFLAGS': ['-X github.com/zricethezav/gitleaks/v{{version.major}}/cmd.Version={{version}}', '-X github.com/zricethezav/gitleaks/v{{version.major}}/version.Version={{version}}'],
      'GO_ARGS': ['-trimpath', '-o="{{prefix}}/bin/gitleaks"'],
    },
  },
}
