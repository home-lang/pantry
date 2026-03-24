import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tlr.dev',
  name: 'teller',
  description: 'Cloud native secrets management for developers - never leave your command line for secrets.',
  github: 'https://github.com/SpectralOps/teller',
  programs: ['teller'],
  versionSource: {
    type: 'github-releases',
    repo: 'SpectralOps/teller',
  },
  distributable: {
    url: 'git+https://github.com/SpectralOps/teller.git',
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'rust-lang.org': '^1.78',
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS" .',
      'cargo install --locked --path teller-cli --root {{prefix}}',
    ],
    env: {
      'COMMIT_SHA': '$(git describe --always --abbrev=8 --dirty)',
      'VERSION_DATE': '$(date -u +%FT%TZ)',
      'GO_ARGS': ['-trimpath', '-o={{prefix}}/bin/teller'],
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}', '-X main.commit=${COMMIT_SHA}', '-X main.date=${VERSION_DATE}'],
    },
  },
}
