import type { Recipe } from '../../../scripts/recipe-types'

// Source build: xorriso isn't on pkgx, so we compile the GNU release (a clean
// autotools build) on its native platform via the residual build channel.
export const recipe: Recipe = {
  domain: 'gnu.org/xorriso',
  name: 'xorriso',
  description: 'ISO 9660 Rock Ridge filesystem manipulator',
  homepage: 'https://www.gnu.org/software/xorriso/',
  programs: ['xorriso', 'xorrisofs', 'xorrecord', 'osirrox'],
  dependencies: {
    'zlib.net': '*',
    'sourceware.org/bzip2': '*',
    'gnu.org/readline': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/xorriso/xorriso-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --build={{ hw.target }} --prefix={{ prefix }}',
      'make -j {{ hw.concurrency }} install',
    ],
  },
}
