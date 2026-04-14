import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mailpit.axllent.org',
  name: 'mailpit',
  description: 'An email and SMTP testing tool with API for developers',
  homepage: 'https://mailpit.axllent.org/',
  github: 'https://github.com/axllent/mailpit',
  programs: ['mailpit'],
  versionSource: {
    type: 'github-releases',
    repo: 'axllent/mailpit',
  },
  distributable: {
    url: 'https://github.com/axllent/mailpit/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
    'nodejs.org': '^18',
    'npmjs.com': '*',
  },

  build: {
    script: [
      'npm install',
      'npm run package',
      'go build -ldflags="$GO_LDFLAGS" -o mailpit',
      'mkdir -p "{{prefix}}"/bin',
      'mv mailpit "{{prefix}}"/bin',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-extldflags=-static', '-w', '-s', '-X=github.com/axllent/mailpit/config.Version=v{{version}}'],
    },
  },
}
