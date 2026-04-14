import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libgeos.org',
  name: 'geos-config',
  description: 'Geometry Engine, Open Source',
  homepage: 'https://libgeos.org/',
  github: 'https://github.com/libgeos/geos',
  programs: ['geos-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'libgeos/geos',
  },
  distributable: {
    url: 'https://github.com/libgeos/geos/releases/download/{{version}}/geos-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}'],
    },
  },
}
