import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'info-zip.org/zip',
  name: 'zip',
  programs: [
    'zip',
    'zipcloak',
    'zipnote',
    'zipsplit',
  ],
  dependencies: {
    'sourceware.org/bzip2': '*',
  },
  buildDependencies: {
    'gnu.org/gcc': '*',
    'gnu.org/wget': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'http://downloads.sourceforge.net/project/infozip/Zip%203.x%20%28latest%29/{{version.marketing}}/zip{{version.major}}{{version.minor}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'wget https://deb.debian.org/debian/pool/main/z/zip/zip_3.0-11.debian.tar.xz && tar xf zip_3.0-11.debian.tar.xz',
        'working-directory': 'patch',
      },
      'patch -p1 < patch/debian/patches/01-typo-it-is-transferring-not-transfering',
      'patch -p1 < patch/debian/patches/02-typo-it-is-privileges-not-priviliges',
      'patch -p1 < patch/debian/patches/03-manpages-in-section-1-not-in-section-1l',
      'patch -p1 < patch/debian/patches/04-do-not-set-unwanted-cflags',
      'patch -p1 < patch/debian/patches/05-typo-it-is-preceding-not-preceeding',
      'patch -p1 < patch/debian/patches/06-stack-markings-to-avoid-executable-stack',
      'patch -p1 < patch/debian/patches/07-fclose-in-file-not-fclose-x',
      'patch -p1 < patch/debian/patches/08-hardening-build-fix-1',
      'patch -p1 < patch/debian/patches/09-hardening-build-fix-2',
      'patch -p1 < patch/debian/patches/10-remove-build-date',
      'make -f unix/Makefile CC={{deps.gnu.org/gcc.prefix}}/bin/gcc generic',
      'make -f unix/Makefile BINDIR={{prefix}}/bin MANDIR={{prefix}}/man/man1 install',
    ],
  },
  test: {
    script: [
      'zip --version | grep "Zip {{version.marketing}}"',
      'zip test.zip test.1.txt test.2.txt test.3.txt',
      'ls | grep \'test.zip\'',
    ],
  },
}
