import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'plocate.sesse.net',
  name: 'plocate.sesse',
  programs: ['plocate', 'plocate-build', 'updatedb'],
  platforms: ['linux'],
  distributable: {
    url: 'https://plocate.sesse.net/download/plocate-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'facebook.com/zstd': '1',
    'gnu.org/gcc/libstdcxx': '14',
  },
  buildDependencies: {
    'mesonbuild.com': '^1',
    'cmake.org': '^3',
    'ninja-build.org': '^1',
    'gnu.org/gcc': '*',
  },

  build: {
    script: [
      'sed -i \'/<linux\\/stat.h>/d\' io_uring_engine.h',
      'sed -i \'/mkdir.sh/s/^/#/\' meson.build',
      'meson setup build $ARGS',
      'ninja -C build',
      'ninja -C build install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--buildtype=release', '-Dinstall_systemd=false', '-Dsharedstatedir=/var/lib', '-Dsystemunitdir={{prefix}}/lib/systemd/system'],
    },
  },
}
