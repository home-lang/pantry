import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libimobiledevice.org/libusbmuxd',
  name: 'libusbmuxd',
  programs: [
    'iproxy',
    'inetcat',
  ],
  dependencies: {
    'libimobiledevice.org/libplist': '^2.4',
    'libimobiledevice.org/libimobiledevice-glue': '^1.2',
  },
  buildDependencies: {
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/libimobiledevice/libusbmuxd/releases/download/{{version.tag}}/libusbmuxd-{{version.tag}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: 'sed -i \'s/\\+brewing//g\' pkgconfig/*.pc',
        'working-directory': '{{prefix}}/lib',
      },
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'iproxy -s localhost 2222:2223 &',
      'PID=$!',
      'sleep 2',
      'curl -v telnet://localhost:2222 2>&1 | tee out',
      'grep \'Connected to localhost\' out || grep \'Established connection to localhost\' out',
      'kill $PID',
      'iproxy -v | tee out',
      'grep {{version}} out',
      'inetcat -v | tee out',
      'grep {{version}} out',
    ],
  },
}
