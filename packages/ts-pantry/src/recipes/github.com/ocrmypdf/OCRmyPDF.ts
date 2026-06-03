import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ocrmypdf/OCRmyPDF',
  name: 'OCRmyPDF',
  programs: [
    'ocrmypdf',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'qpdf.sourceforge.io': '^12',
    darwin: {
      'simplesystems.org/libtiff': '^4',
      'openjpeg.org': '^2',
      'libjpeg-turbo.org': '^2',
      'zlib.net': '^1',
      'x.org/xcb': '^1',
      'gnome.org/libxml2': '~2.13',
      'gnome.org/libxslt': '=1.1.43',
      'littlecms.com': '^2',
      'github.com/strukturag/libheif': '~1.18',
    },
  },
  buildDependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/ocrmypdf/OCRmyPDF/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      {
        run: '{{prefix}}/venv/bin/pip install --no-cache-dir --force-reinstall --no-binary :all: pikepdf\\>=10 pi_heif',
        if: 'darwin',
      },
      'bkpyvenv seal {{prefix}} ocrmypdf',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
      CC: 'clang',
      LD: 'clang',
    },
  },
  test: {
    script: [
      'test "$(ocrmypdf --version)" = {{version}}',
    ],
  },
}
