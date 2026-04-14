import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ctop.sh',
  name: 'ctop',
  description: 'Top-like interface for container metrics',
  homepage: 'https://bcicen.github.io/ctop/',
  github: 'https://github.com/bcicen/ctop',
  programs: ['ctop'],
  versionSource: {
    type: 'github-releases',
    repo: 'bcicen/ctop',
  },
  distributable: {
    url: 'https://github.com/bcicen/ctop/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.18',
  },

  build: {
    script: [
      'go mod download',
      'go build -tags release -ldflags="$GO_LDFLAGS" -o "{{prefix}}/bin/ctop"',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}', '-X main.build=pkgx'],
    },
  },
}
