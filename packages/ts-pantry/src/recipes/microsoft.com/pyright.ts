import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/pyright',
  name: 'pyright',
  programs: [
    'pyright',
  ],
  dependencies: {
    'nodejs.org': '^20',
  },
  buildDependencies: {
    'npmjs.com': '*',
  },
  distributable: {
    url: 'https://registry.npmjs.org/pyright/-/pyright-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm i $ARGS .',
    ],
    env: {
      ARGS: [
        '-ddd',
        '--global',
        '--build-from-source',
        '--prefix={{prefix}}',
        '--install-links',
        '--unsafe-perm',
      ],
    },
  },
  test: {
    script: [
      '(pyright $FIXTURE 2>&1 || true) | tee out.log',
      'cat out.log | grep -E \'ype "int" (cannot be assigned to|is incompatible with|is not assignable to) return type "str"\'',
      'pyright $FIXTURE 2>&1 | grep \'0 errors, 0 warnings, 0 informations\'',
      'pyright --version | grep {{version}}',
    ],
  },
}
