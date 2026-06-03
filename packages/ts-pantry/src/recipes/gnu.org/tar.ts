import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/tar',
  name: 'tar',
  programs: [
    'tar',
  ],
  buildDependencies: {
    'gnu.org/patch': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/tar/tar-{{ version.marketing }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'patch -p1 <props/iconv.patch',
        if: '=1.35.0',
      },
      './configure --prefix={{ prefix }} --disable-debug',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
