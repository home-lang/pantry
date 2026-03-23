import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'd2lang.com',
  name: 'd2',
  description: 'D2 is a modern diagram scripting language that turns text to diagrams.',
  homepage: 'https://d2lang.com/',
  github: 'https://github.com/terrastruct/d2',
  programs: ['d2'],
  versionSource: {
    type: 'github-releases',
    repo: 'terrastruct/d2',
  },
  distributable: {
    url: 'https://github.com/terrastruct/d2/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
      '',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/d2',
      'LDFLAGS': ['-s', '-w', '-X oss.terrastruct.com/d2/lib/version.Version={{version}}'],
    },
  },
}
