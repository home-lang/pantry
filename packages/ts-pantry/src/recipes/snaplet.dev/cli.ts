import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'snaplet.dev/cli',
  name: 'cli',
  programs: [
    'snaplet',
  ],
  dependencies: {
    'nodejs.org': '^10.13.0 || ^12 || ^14 || ^16 || ^18 || ^20',
  },
  buildDependencies: {
    'npmjs.com': '*',
    'linux/x86-64': {
      'python.org': '^3',
    },
  },
  distributable: {
    url: 'https://registry.npmjs.org/snaplet/-/snaplet-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'chmod +x bin/snaplet.js',
      'npm install . --global --prefix={{prefix}} --install-links',
    ],
    env: {
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
  test: {
    script: [
      'snaplet -v | grep {{version}}',
      'snaplet config list',
    ],
  },
}
