import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'gohugo.io',
  name: 'hugo',
  description: 'The world’s fastest framework for building websites.',
  homepage: 'https://gohugo.io/',
  github: 'https://github.com/gohugoio/hugo',
  programs: ['hugo'],
  versionSource: {
    type: 'github-releases',
    repo: 'gohugoio/hugo',
  },
  distributable: {
    url: 'https://github.com/gohugoio/hugo/archive/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.22.6',
  },

  build: {
    script: [
      'go build -ldflags="$GO_LDFLAGS" -o "{{ prefix }}/bin/hugo" -tags extended,withdeploy',
    ],
    env: {
      'CGO_ENABLED': '1',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/gohugoio/hugo/common/hugo.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')', '-X github.com/gohugoio/hugo/common/hugo.vendorInfo=pkgx'],
    },
  },
}
