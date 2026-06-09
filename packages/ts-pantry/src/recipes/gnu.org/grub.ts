import type { Recipe } from '../../../scripts/recipe-types'

// Source build: GRUB isn't on pkgx. It's a Linux bootloader toolset, built from the
// GNU release on linux only. NOTE: GNU ships `grub-<major>.<minor>` (e.g. grub-2.12),
// so the URL uses version.marketing, not the catalog's spurious 3-part `2.12.0`.
export const recipe: Recipe = {
  domain: 'gnu.org/grub',
  name: 'grub',
  description: 'GNU GRand Unified Bootloader',
  homepage: 'https://www.gnu.org/software/grub/',
  platforms: ['linux'],
  programs: [
    'grub-editenv',
    'grub-file',
    'grub-fstest',
    'grub-install',
    'grub-mkconfig',
    'grub-mkimage',
    'grub-mkrescue',
    'grub-mkstandalone',
    'grub-mount',
    'grub-probe',
    'grub-script-check',
  ],
  dependencies: {
    'gnu.org/gettext': '*',
    'sourceware.org/bzip2': '*',
    'tukaani.org/xz': '*',
    'zlib.net': '*',
    'gnupg.org/libgcrypt': '*',
    'gnu.org/libunistring': '*',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'gnu.org/m4': '*',
    'github.com/westes/flex': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/grub/grub-{{ version.marketing }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --build={{ hw.target }} --prefix={{ prefix }} --disable-werror',
      'make -j {{ hw.concurrency }}',
      'make install',
    ],
  },
}
