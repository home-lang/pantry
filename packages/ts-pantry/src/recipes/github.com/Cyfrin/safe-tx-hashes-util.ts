import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Cyfrin/safe-tx-hashes-util',
  name: 'safe-tx-hashes-util',
  programs: [
    'safe_hashes',
  ],
  dependencies: {
    'gnu.org/bash': '>=4',
    'gnu.org/gcc/libstdcxx': 14,
  },
  distributable: {
    url: 'https://github.com/Cyfrin/safe-tx-hashes-util/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'install -Dm755 safe_hashes.sh {{prefix}}/bin/safe_hashes',
    ],
  },
  test: {
    script: [
      'curl -O https://raw.githubusercontent.com/Cyfrin/safe-tx-hashes/refs/tags/{{ version.tag }}/test.sh',
      'chmod +x test.sh',
      'sed -i \'s|\\./safe_hashes.sh|safe_hashes|\' test.sh',
      './test.sh',
    ],
  },
}
