import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vercel.com/pkg',
  name: 'pkg',
  programs: [
    'pkg',
  ],
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'npmjs.com': '*',
  },
  distributable: {
    url: 'https://github.com/vercel/pkg/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm i',
      'npm install --global --build-from-source --prefix={{prefix}} --install-links',
    ],
  },
  test: {
    script: [
      'test "$(pkg --version)" = "{{version.raw}}"',
      'pkg fixture.js -t node18-$TARGET -o fixture',
      'test "$(./fixture)" = "Hello, World!"',
    ],
  },
}
