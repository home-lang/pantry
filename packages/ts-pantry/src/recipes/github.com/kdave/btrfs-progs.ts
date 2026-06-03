import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kdave/btrfs-progs',
  name: 'btrfs-progs',
  programs: [
    'btrfs',
    'btrfsck',
    'btrfs-convert',
    'btrfs-find-root',
    'btrfs-image',
    'btrfs-map-logical',
    'btrfs-select-super',
    'btrfstune',
    'fsck.btrfs',
    'mkfs.btrfs',
  ],
  dependencies: {
    'python.org': '~3.14',
    'sourceforge.net/e2fsprogs': '^1.47',
    'oberhumer.com/lzo': '^2.10',
    'systemd.io': '^255',
    'github.com/util-linux/util-linux': '^2.39',
    'zlib.net': '^1.3',
    'facebook.com/zstd': '^1.5',
  },
  buildDependencies: {
    'sphinx-doc.org': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/kdave/btrfs-progs/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'/sphinx_rtd_theme/s/^/#/\' Documentation/conf.py',
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install V=1 udevdir={{prefix}}/lib/udev',
      'python -m pip install --prefix={{prefix}} ./libbtrfsutil/python',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'btrfs --version | grep {{version.tag}}',
      'truncate -s 128M test.img',
      'mkfs.btrfs test.img | grep \'128.00MiB\'',
      'btrfs filesystem show test.img | grep \'Total devices 1 FS\'',
      'python -c \'import btrfsutil\'',
    ],
  },
}
