import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openpolicyagent.org',
  name: 'opa',
  description: 'Open Policy Agent (OPA) is an open source, general-purpose policy engine.',
  homepage: 'https://www.openpolicyagent.org',
  github: 'https://github.com/open-policy-agent/opa',
  programs: ['opa'],
  versionSource: {
    type: 'github-releases',
    repo: 'open-policy-agent/opa',
  },
  distributable: {
    url: 'https://github.com/open-policy-agent/opa/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o $BUILDLOC .',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-s', '-w', '-X github.com/open-policy-agent/opa/version.Version={{version}}'],
      'BUILDLOC': '{{prefix}}/bin/opa',
    },
  },
}
