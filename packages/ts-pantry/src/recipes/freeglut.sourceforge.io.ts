import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freeglut.sourceforge.io',
  name: 'freeglut.sourceforge',
  description: 'Free implementation of the OpenGL Utility Toolkit (GLUT)',
  homepage: 'https://freeglut.sourceforge.net',
  github: 'https://github.com/FreeGLUTProject/freeglut',
  programs: [],
  platforms: ['linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'FreeGLUTProject/freeglut',
  },
  distributable: {
    url: 'https://github.com/FreeGLUTProject/freeglut/releases/download/v{{version}}/freeglut-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'x.org/x11': '*',
    'x.org/xi': '*',
    'x.org/xrandr': '*',
    'x.org/xxf86vm': '*',
    'mesa3d.org': '*',
    'linux': {
      'freedesktop.org/mesa-glu': '*',
      'x.org/xinput': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $ARGS .',
      'make --jobs {{hw.concurrency}} all',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-DFREEGLUT_BUILD_DEMOS=OFF', '-DOPENGL_INCLUDE_DIR={{deps.mesa3d.org.prefix}}/include', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
      'linux': {
        'ARGS': ['-DOPENGL_gl_LIBRARY={{deps.mesa3d.org.prefix}}/lib/libGL.so.1'],
      },
    },
  },
}
