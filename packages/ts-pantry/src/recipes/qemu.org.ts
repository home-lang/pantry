import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'qemu.org',
  name: 'qemu',
  description: 'Generic machine emulator and virtualizer',
  homepage: 'https://www.qemu.org/',
  programs: ['qemu-img', 'qemu-edid', 'qemu-io', 'qemu-nbd', 'qemu-storage-daemon', 'qemu-system-aarch64', 'qemu-system-alpha', 'qemu-system-arm', 'qemu-system-avr', 'qemu-system-hppa', 'qemu-system-i386', 'qemu-system-loongarch64', 'qemu-system-m68k', 'qemu-system-microblaze', 'qemu-system-microblazeel', 'qemu-system-mips', 'qemu-system-mips64', 'qemu-system-mips64el', 'qemu-system-mipsel', 'qemu-system-or1k', 'qemu-system-ppc', 'qemu-system-ppc64', 'qemu-system-riscv32', 'qemu-system-riscv64', 'qemu-system-rx', 'qemu-system-s390x', 'qemu-system-sh4', 'qemu-system-sh4eb', 'qemu-system-sparc', 'qemu-system-sparc64', 'qemu-system-tricore', 'qemu-system-x86_64', 'qemu-system-xtensa', 'qemu-system-xtensaeb'],
  distributable: {
    url: 'https://download.qemu.org/qemu-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib': '2',
    'pixman.org': '^0',
    'gnutls.org': '^3',
    'facebook.com/zstd': '^1',
    'invisible-island.net/ncurses': '^6',
    'libpng.org': '^1',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
    'python.org': '~3.11',
    'ninja-build.org': '*',
    'mesonbuild.com': '*',
  },

  build: {
    script: [
      'pip3 install distlib 2>/dev/null || python3 -m pip install distlib 2>/dev/null || true',
      'ARGS="$ARGS --enable-virtfs"',
      'sed -i.bak -e"s/-isystem\', /-isystem\' + /g" meson.build',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'xattr -cr {{prefix}}/bin/*',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-bsd-user', '--disable-guest-agent', '--enable-slirp', '--enable-capstone', '--enable-curses', '--enable-libssh', '--enable-zstd', '--extra-cflags=-DNCURSES_WIDECHAR=1', '--disable-sdl', '--disable-docs', '--disable-slirp', '--disable-capstone', '--disable-libssh'],
    },
  },
}
