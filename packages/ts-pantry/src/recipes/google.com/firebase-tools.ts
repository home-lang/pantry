import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/firebase-tools',
  name: 'firebase-tools',
  programs: [
    'firebase',
  ],
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'npmjs.com': '*',
  },
  distributable: {
    url: 'https://registry.npmjs.org/firebase-tools/-/firebase-tools-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'chmod +x lib/bin/firebase.js',
      'npm install . --global --prefix="{{prefix}}" --install-links',
    ],
  },
  test: {
    script: [
      'firebase --version | grep {{version}}',
    ],
  },
}
