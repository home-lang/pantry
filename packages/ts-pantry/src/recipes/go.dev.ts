import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'go.dev',
  name: 'go',
  description: 'The Go programming language',
  homepage: 'https://go.dev',
  github: 'https://github.com/golang/go',
  programs: ['go', 'gofmt'],
  versionSource: {
    type: 'github-releases',
    repo: 'golang/go',
    tagPattern: /^go(.+)$/,
  },
  distributable: {
    url: 'https://go.dev/dl/go{{version.raw}}.src.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '1',
  },
  buildDependencies: {
    'gnu.org/m4': '1',
    'go.dev': '*',
  },

  build: {
    script: [
      './make.bash',
      'rm *.{bash,bat,rc} Make.dist',
      'cd "${{prefix}}"',
      'find . -mindepth 1 -delete',
      'cd "$SRCROOT"',
      'cp -a api bin doc lib misc pkg src test "{{prefix}}"',
      'if test -f go.env; then',
      '  cp go.env "{{prefix}}"',
      'fi',
      '',
    ],
    env: {
      'GOCACHE': '$SRCROOT/.gocache',
      'GOROOT_FINAL': '${{prefix}}',
      'GOROOT_BOOTSTRAP': '${{deps.go.dev.prefix}}',
    },
    skip: ['fix-patchelf'],
  },
}
