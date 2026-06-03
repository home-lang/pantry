import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/rrthomas/psutils',
  name: 'psutils',
  programs: [
    'psbook',
    'psjoin',
    'psnup',
    'psresize',
    'psselect',
    'pstops',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'github.com/rrthomas/libpaper': '*',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'https://github.com/rrthomas/psutils/releases/download/v{{version}}/pspdfutils-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'rm -rf props',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} psbook psjoin psnup psresize psselect pstops',
    ],
  },
  test: {
    script: [
      'wget https://raw.githubusercontent.com/rrthomas/psutils/e00061c21e114d80fbd5073a4509164f3799cc24/tests/test-files/psbook/3/expected.ps',
      'psbook expected.ps book.ps 2>&1 | grep "Wrote 4 pages"',
      'psnup -2 expected.ps nup.ps 2>&1 | grep "Wrote 2 pages"',
      'psselect -p1 expected.ps test2.ps 2>&1 | grep "Wrote 1 pages"',
      'psbook --version | grep {{version}}',
    ],
  },
}
