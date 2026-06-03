import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ghostgum.com.au/epstool',
  name: 'epstool',
  programs: [
    'epstool',
  ],
  dependencies: {
    'ghostscript.com': '*',
  },
  distributable: {
    url: 'https://ftp.debian.org/debian/pool/main/e/epstool/epstool_{{version.raw}}.orig.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'chmod -R u+rwX .',
      'make install EPSTOOL_ROOT={{prefix}} EPSTOOL_MANDIR={{prefix}}/man',
    ],
  },
  test: {
    script: [
      'epstool --add-tiff-preview --device tiffg3 $FIXTURE out.eps',
      'test -f out.eps',
    ],
  },
}
