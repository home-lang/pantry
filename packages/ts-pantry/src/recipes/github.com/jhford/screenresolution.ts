import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jhford/screenresolution',
  name: 'screenresolution',
  programs: [
    'screenresolution',
  ],
  distributable: {
    url: 'https://github.com/jhford/screenresolution/archive/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'curl $PATCH | patch -p1 || true',
      'make',
      'make PREFIX={{prefix}} install',
    ],
    env: {
      PATCH: 'https://github.com/jhford/screenresolution/commit/c3c1e5c498cf2e1fbe37f90899a3d440305398bd.patch',
    },
  },
}
