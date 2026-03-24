import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'changie.dev',
  name: 'changie',
  description: 'Automated changelog tool for preparing releases with lots of customization options',
  homepage: 'https://changie.dev/',
  github: 'https://github.com/miniscruff/changie',
  programs: ['changie'],
  versionSource: {
    type: 'github-releases',
    repo: 'miniscruff/changie',
  },
  distributable: {
    url: 'git+https://github.com/miniscruff/changie.git',
  },
  buildDependencies: {
    'go.dev': '>=1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/changie'],
      'LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
