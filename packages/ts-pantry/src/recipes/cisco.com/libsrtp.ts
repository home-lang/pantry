import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cisco.com/libsrtp',
  name: 'libsrtp',
  programs: [],
  dependencies: {
    'openssl.org': '~1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/cisco/libsrtp/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} test',
      'make --jobs {{ hw.concurrency }} shared_library',
      'make --jobs {{ hw.concurrency }} install',
      'mkdir -p {{prefix}}/libexec',
      {
        run: 'cp rtpw {{prefix}}/libexec/',
        'working-directory': 'test',
      },
    ],
    env: {
      linux: {
        LDFLAGS: '-fPIC',
      },
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--enable-openssl',
      ],
    },
  },
  test: {
    script: [
      '{{prefix}}/libexec/rtpw -l | grep {{version}}',
    ],
  },
}
