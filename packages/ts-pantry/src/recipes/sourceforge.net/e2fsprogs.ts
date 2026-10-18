import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/e2fsprogs',
  name: 'e2fsprogs',
  programs: ['chattr', 'compile_et', 'lsattr', 'mk_cmds', 'mke2fs', 'debugfs', 'dumpe2fs'],
  buildDependencies: { 'gnu.org/coreutils': '*' },
  dependencies: {
    darwin: {
      'gnu.org/gettext': '^0.22',
    },
    linux: {
      'github.com/util-linux/util-linux': '^2.39',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/e2fsprogs/e2fsprogs/v{{version}}/e2fsprogs-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: './configure $ARGS',
        if: 'linux',
      },
      {
        run: "./configure $ARGS MKDIR_P='mkdir -p'",
        if: 'darwin',
      },
      'make --jobs {{hw.concurrency}}',
      'make install',
      'make install-libs',
      {
        run: "sed -i 's|{{prefix}}|\\$(dirname \\$0)/..|g' compile_et mk_cmds",
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--exec-prefix={{prefix}}',
        '--disable-e2initrd-helper',
        '--without-udev-rules-dir',
        '--without-systemd-unit-dir',
      ],
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
        ARGS: [
          '--enable-elf-shlibs',
          '--disable-fsck',
          '--disable-uuidd',
          '--disable-libuuid',
          '--disable-libblkid',
          '--without-crond-dir',
        ],
      },
      darwin: {
        ARGS: [
          '--enable-bsd-shlibs',
        ],
      },
    },
  },
  test: {
    required: true,
    script: [
      'mke2fs -V 2>&1 | grep -F "{{version}}"',
      'mkdir guest-fixture',
      'printf "pantry-rootless-ext4" > guest-fixture/probe',
      'truncate -s 32M guest.ext4',
      'mke2fs -q -F -t ext4 -d guest-fixture guest.ext4',
      'test "$(debugfs -R \'cat /probe\' guest.ext4 2>/dev/null)" = pantry-rootless-ext4',
      'dumpe2fs -h guest.ext4 2>/dev/null | grep -F 0xEF53',
    ],
  },
}
