import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'open-mpi.org/hwloc',
  name: 'hwloc',
  programs: [
    'hwloc-annotate',
    'hwloc-bind',
    'hwloc-calc',
    'hwloc-compress-dir',
    'hwloc-diff',
    'hwloc-distrib',
    'hwloc-info',
    'hwloc-patch',
    'hwloc-ps',
    'lstopo-no-graphics',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://download.open-mpi.org/release/hwloc/v{{version.marketing}}/hwloc-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--enable-shared',
        '--enable-static',
        '--disable-cairo',
        '--without-x',
        '--disable-cpuid',
      ],
    },
  },
}
