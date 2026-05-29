import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'werf.io',
  name: 'werf',
  description: 'A solution for implementing efficient and consistent software delivery to Kubernetes facilitating best practices.',
  homepage: 'https://werf.io/',
  github: 'https://github.com/werf/werf',
  programs: ['werf'],
  versionSource: {
    type: 'github-releases',
    repo: 'werf/werf',
  },
  distributable: {
    url: 'https://github.com/werf/werf/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.23',
    linux: {
      'gnu.org/gcc': '14',
      'gnu.org/binutils': '~2.44', // some go packages demand ld.gold, but it's being deprecated
      'github.com/kdave/btrfs-progs': '^6.7',
    },
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LD_FLAGS" -tags="$TAGS" ./cmd/werf',
    ],
    env: {
      'TAGS': ['dfrunsecurity', 'dfrunnetwork', 'dfrunmount', 'dfssh', 'containers_image_openpgp'],
      'LD_FLAGS': ['-s', '-w', '-X github.com/werf/werf/pkg/werf.Version={{version}}', '-X github.com/werf/werf/v2/pkg/werf.Version={{version}}'],
      'ARGS': ['-v', '-trimpath', '-o={{prefix}}/bin/werf'],
      'linux': {
        LD_FLAGS: ['-linkmode external', '-extldflags=-static', '-buildmode=pie'],
        TAGS: ['osusergo', 'exclude_graphdriver_devicemapper', 'netgo', 'no_devmapper', 'static_build', 'cni'],
      },
    },
  },
}
