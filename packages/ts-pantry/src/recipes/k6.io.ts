import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'k6.io',
  name: 'k6',
  description: 'A modern load testing tool, using Go and JavaScript - https://k6.io',
  homepage: 'https://k6.io',
  github: 'https://github.com/grafana/k6',
  programs: ['k6'],
  versionSource: {
    type: 'github-releases',
    repo: 'grafana/k6/tags',
  },
  distributable: {
    url: 'https://github.com/grafana/k6/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv k6 "{{ prefix }}"/bin',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X main.version={{ version }}', '-X main.revision=tea'],
    },
  },
}
