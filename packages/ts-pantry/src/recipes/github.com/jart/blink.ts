import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jart/blink',
  name: 'blink',
  programs: [
    'blink',
    'blinkenlights',
  ],
  buildDependencies: {
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/jart/blink/archive/13df12124d69aba8a7f74803715af36ed629b349.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'make -j {{hw.concurrency}}',
      'cp o/blink/blink{,enlights} {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'curl -O https://raw.githubusercontent.com/jart/blink/13df12124d69aba8a7f74803715af36ed629b349/third_party/cosmo/tinyhello.elf',
      'blink tinyhello.elf',
    ],
  },
}
