import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/AgentD/squashfs-tools-ng',
  name: 'squashfs-tools-ng',
  programs: [
    'gensquashfs',
    'rdsquashfs',
    'sqfs2tar',
    'tar2sqfs',
    'sqfsdiff',
  ],
  dependencies: {
    'zlib.net': '^1',
    'tukaani.org/xz': '^5',
    'lz4.org': '^1',
    'facebook.com/zstd': '^1',
    'oberhumer.com/lzo': '^2',
  },
  buildDependencies: {
    'gnu.org/coreutils': '*',
    'gnu.org/libtool': '*',
    'gnu.org/gawk': '*',
    'gnu.org/gcc': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://infraroot.at/pub/squashfs/squashfs-tools-ng-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install V=1',
    ],
  },
}
