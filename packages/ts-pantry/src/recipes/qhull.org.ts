import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'qhull.org',
  name: 'qhull',
  description: 'Qhull development for www.qhull.org -- Qhull 2020.2 (8.1-alpha1) at https://github.com/qhull/qhull/wiki',
  homepage: 'https://www.qhull.org/',
  github: 'https://github.com/qhull/qhull',
  programs: ['qconvex', 'qdelaunay', 'qhalf', 'qhull', 'qvoronoi', 'rbox'],
  versionSource: {
    type: 'github-releases',
    repo: 'qhull/qhull',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/qhull/qhull/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DLIB_INSTALL_DIR="{{prefix}}"/lib'],
    },
  },
}
