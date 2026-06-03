import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vercel.com/next',
  name: 'next',
  programs: [
    'next',
  ],
  dependencies: {
    'nodejs.org': '^20.9.0',
  },
  buildDependencies: {
    'npmjs.com': '^11',
  },
  distributable: {
    url: 'https://registry.npmjs.org/next/-/next-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm install --global --prefix={{prefix}} --install-links .',
    ],
  },
  test: {
    script: [
      'next --version | grep {{version}}',
      'next --help | grep -i usage',
    ],
  },
}
