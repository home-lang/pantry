import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'buildpacks.io',
  name: 'pack',
  description: 'CLI for building apps using Cloud Native Buildpacks',
  homepage: 'https://buildpacks.io',
  github: 'https://github.com/buildpacks/pack',
  programs: ['pack'],
  versionSource: {
    type: 'github-releases',
    repo: 'buildpacks/pack',
  },
  distributable: {
    url: 'https://github.com/buildpacks/pack/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.24',
  },

  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/pack ./cmd/pack',
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/pack .',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/buildpacks/pack.Version={{ version }}', '-X github.com/buildpacks/pack/pkg/client.Version={{ version }}'],
    },
  },
}
