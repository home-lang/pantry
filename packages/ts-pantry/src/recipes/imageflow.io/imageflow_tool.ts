import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'imageflow.io/imageflow_tool',
  name: 'imageflow_tool',
  // https://github.com/imazen/imageflow/issues/592 — darwin gives illegal instructions
  platforms: [
    'linux/x86-64',
  ],
  programs: [
    'imageflow_tool',
  ],
  dependencies: {
    'openssl.org': '1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65<1.78', // uses feature(stdsimd)
    'rust-lang.org/cargo': '*',
    'nasm.us': '*',
    'info-zip.org/zip': '*',
    'kornel.ski/dssim': '*',
  },
  distributable: {
    url: 'git+https://github.com/imazen/imageflow.git',
    ref: 'v2.0.0-preview8',
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
    skip: ['fix-machos'], // or illegal instructions
  },
}
