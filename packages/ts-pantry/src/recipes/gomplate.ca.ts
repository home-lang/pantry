import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gomplate.ca',
  name: 'gomplate',
  description: 'A flexible commandline tool for template rendering. Supports lots of local and remote datasources.',
  homepage: 'https://gomplate.ca/',
  github: 'https://github.com/hairyhenderson/gomplate',
  programs: ['gomplate'],
  versionSource: {
    type: 'github-releases',
    repo: 'hairyhenderson/gomplate',
  },
  distributable: {
    url: 'https://github.com/hairyhenderson/gomplate/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    // gomplate v5 requires Go >= 1.25 (go.mod: `go 1.25.6`); the old ~1.22.3
    // pin made `go build` fail before it even read the module.
    'go.dev': '>=1.25',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/gomplate ./cmd/gomplate',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X $(go list ./version).Version={{version}}'],
    },
  },
}
