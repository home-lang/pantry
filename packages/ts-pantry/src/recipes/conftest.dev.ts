import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'conftest.dev',
  name: 'conftest',
  description: 'Write tests against structured configuration data using the Open Policy Agent Rego query language',
  homepage: 'https://www.conftest.dev/',
  github: 'https://github.com/open-policy-agent/conftest',
  programs: ['conftest'],
  versionSource: {
    type: 'github-releases',
    repo: 'open-policy-agent/conftest',
  },
  distributable: {
    url: 'https://github.com/open-policy-agent/conftest/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.25.3',
  },

  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o \'{{prefix}}/bin/conftest\' .',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-X github.com/open-policy-agent/conftest/internal/commands.version={{version}}', '-X github.com/open-policy-agent/conftest/internal/version.Version={{version}}'],
    },
  },
}
