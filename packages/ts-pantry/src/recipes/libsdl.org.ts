import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libsdl.org',
  name: 'libsdl',
  description: 'Simple Directmedia Layer',
  homepage: 'https://libsdl.org',
  github: 'https://github.com/libsdl-org/SDL',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libsdl-org/SDL',
  },
  distributable: {
    url: 'https://github.com/libsdl-org/SDL/archive/refs/tags/release-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    linux: {
      'alsa-project.org/alsa-lib': '>=1.0.11',
      'x.org/x11': '*',
      'x.org/xcursor': '*',
      'x.org/xi': '*',
      'x.org/xrandr': '*',
      'x.org/xfixes': '*',
      'x.org/xrender': '*',
      'x.org/xscrnsaver': '*',
      'x.org/exts': '*',
    },
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '2',
    'cmake.org': '^3',
  },

  build: {
    script: [
      {
        run: [
          './configure $ARGS',
          'make --jobs {{hw.concurrency}} install',
        ],
        if: '<3.2',
      },
      {
        run: [
          'if test "{{hw.platform}}" = "linux"; then',
          'export CMAKE_ARGS="$CMAKE_ARGS -DSDL_X11_XTEST=OFF"',
          'fi',
        ],
        if: '>=3.4',
      },
      {
        run: [
          'cmake -S .. $CMAKE_ARGS',
          'cmake --build .',
          'cmake --install .',
        ],
        if: '>=3.2',
        'working-directory': 'build',
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--with-x', '--enable-hidapi', '--enable-alsa', '--enable-alsa-shared', '--enable-video-dummy', '--enable-video-opengl', '--enable-video-opengles', '--enable-video-x11', '--enable-video-x11-scrnsaver', '--enable-video-x11-xcursor', '--enable-video-x11-xinerama', '--enable-video-x11-xinput', '--enable-video-x11-xrandr', '--enable-video-x11-xshape', '--enable-x11-shared'],
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-Wno-dev', '-DSDL_INSTALL=ON', '-DSDL_HIDAPI=ON', '-DSDL_ALSA=ON', '-DSDL_ALSA_SHARED=ON', '-DSDL_DUMMYVIDEO=ON', '-DSDL_OPENGL=ON', '-DSDL_OPENGLES=ON', '-DSDL_X11=ON', '-DSDL_X11_XSCRNSAVER=ON', '-DSDL_X11_XCURSOR=ON', '-DSDL_X11_XINPUT=ON', '-DSDL_X11_XRANDR=ON', '-DSDL_X11_XSHAPE=ON', '-DSDL_X11_SHARED=ON'],
      'CFLAGS': '-Wno-incompatible-function-pointer-types',
    },
  },
}
