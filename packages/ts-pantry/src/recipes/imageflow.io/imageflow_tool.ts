import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'imageflow.io/imageflow_tool',
  name: 'imageflow_tool',
  programs: [
    'imageflow_tool',
  ],
  dependencies: {
    'openssl.org': 1.1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65<1.78',
    'rust-lang.org/cargo': '*',
    'nasm.us': '*',
    'info-zip.org/zip': '*',
    'kornel.ski/dssim': '*',
  },
  distributable: {
    url: 'git+https://github.com/imazen/imageflow.git',
  },
  build: {
    script: [
      './build.sh release',
      'mkdir -p \'{{prefix}}\'/{bin,lib,include}',
      './artifacts/staging/install.sh',
    ],
    env: {
      INSTALL_BASE: '${{prefix}}',
    },
  },
  test: {
    script: [
      'pango-view --height=50 --width=50 -qo hi.png $FIXTURE',
      'imageflow_tool v1/querystring --in hi.png --out hi.jpg --command "width=100&height=100&scale=both&format=jpg" | tee imageflow.out',
      'grep "\\"success\\": true," imageflow.out',
      'file hi.jpg | tee file.out grep \'JPEG image\' file.out',
      'grep 100x100 file.out',
    ],
  },
}
