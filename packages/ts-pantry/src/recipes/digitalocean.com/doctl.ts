import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'digitalocean.com/doctl',
  name: 'doctl',
  programs: [
    'doctl',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/digitalocean/doctl/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/doctl',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/doctl',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/digitalocean/doctl.Major={{version.major}}',
        '-X github.com/digitalocean/doctl.Minor={{version.minor}}',
        '-X github.com/digitalocean/doctl.Patch={{version.patch}}',
        '-X github.com/digitalocean/doctl.Label=release',
      ],
    },
  },
  test: {
    script: [
      'doctl version | grep {{version}}',
      'doctl help | grep \'doctl is a command line interface (CLI) for the DigitalOcean API\'',
    ],
  },
}
