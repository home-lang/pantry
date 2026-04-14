import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vitejs.dev',
  name: 'vite',
  description: 'Next generation frontend tooling',
  homepage: 'https://vitejs.dev/',
  programs: ['vite'],
  distributable: {
    url: 'https://registry.npmjs.org/vite/-/vite-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^16 || ^18 || ^20',
  },

  build: {
    script: [
      'npm install . --global --install-links --prefix="{{prefix}}"',
      'cd "${{prefix}}/lib"',
      'for x in $(pkgx fd --type x); do',
      'if lipo $x -thin $(uname -m) -output $x.new; then',
      '  mv $x.new $x',
      'fi',
      '',
      'done',
    ],
  },
}
