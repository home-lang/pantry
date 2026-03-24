import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sentry.io',
  name: 'sentry-cli',
  description: 'Command-line utility to interact with Sentry',
  homepage: 'https://docs.sentry.io/cli/',
  github: 'https://github.com/getsentry/sentry-cli',
  programs: ['sentry-cli'],
  versionSource: {
    type: 'github-releases',
    repo: 'getsentry/sentry-cli',
  },
  distributable: {
    url: 'https://github.com/getsentry/sentry-cli/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libgit2.org': '~1.7',
    'curl.se': '8',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '^0.91',
  },

  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      'ARGS': ['--locked', '--root={{prefix}}', '--path=.'],
    },
  },
}
