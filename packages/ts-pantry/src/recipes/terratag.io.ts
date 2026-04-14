import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terratag.io',
  name: 'terratag',
  description: 'Terratag is a CLI tool that enables users of Terraform to automatically create and maintain tags across their entire set of AWS, Azure, and GCP resources',
  homepage: 'https://terratag.io',
  github: 'https://github.com/env0/terratag',
  programs: ['terratag'],
  versionSource: {
    type: 'github-releases',
    repo: 'env0/terratag',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/env0/terratag/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'terraform.io': '>=0.12',
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o terratag ./cmd/terratag',
      'mkdir -p "{{prefix}}"/bin',
      'mv terratag "{{prefix}}"/bin',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-extldflags=-static', '-w', '-s', '-X=main.version=v{{version}}'],
    },
  },
}
