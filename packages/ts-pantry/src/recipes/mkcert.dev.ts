import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mkcert.dev',
  name: 'mkcert',
  description: 'A simple zero-config tool to make locally trusted development certificates',
  homepage: 'https://mkcert.dev',
  github: 'https://github.com/FiloSottile/mkcert',
  programs: ['mkcert'],
  versionSource: {
    type: 'github-releases',
    repo: 'FiloSottile/mkcert',
  },
  distributable: {
    url: 'https://github.com/FiloSottile/mkcert/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p "{{prefix}}"/bin',
      'mv mkcert "{{prefix}}"/bin',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X=main.Version={{version}}'],
    },
  },
}
