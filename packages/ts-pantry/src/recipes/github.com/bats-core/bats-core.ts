import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/bats-core/bats-core',
  name: 'bats-core',
  programs: [
    'bats',
  ],
  dependencies: {
    'gnu.org/coreutils': '^9.4',
  },
  distributable: {
    url: 'git+https://github.com/bats-core/bats-core.git',
  },
  build: {
    script: [
      './install.sh {{prefix}}',
    ],
  },
  test: {
    script: [
      'cp $FIXTURE test.sh',
      'bats test.sh | grep \'addition\'',
      'bats --version | grep {{version}}',
    ],
  },
}
