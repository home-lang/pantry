import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kpt.dev',
  name: 'kpt',
  description: 'Automate Kubernetes Configuration Editing',
  homepage: 'https://kpt.dev',
  github: 'https://github.com/kptdev/kpt',
  programs: ['kpt'],
  versionSource: {
    type: 'github-releases',
    repo: 'kptdev/kpt/tags',
  },
  distributable: {
    url: 'https://github.com/kptdev/kpt/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'git-scm.org': '*',
  },
  buildDependencies: {
    'go.dev': '^1.14',
  },

  build: {
    script: [
      'go build -v -trimpath -ldflags="$LDFLAGS" -o "{{prefix}}/bin/kpt" .',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X github.com/GoogleContainerTools/kpt/run.version={{version}}'],
    },
  },
}
