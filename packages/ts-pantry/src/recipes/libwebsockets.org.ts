import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libwebsockets.org',
  name: 'libwebsockets',
  description: 'canonical libwebsockets.org networking library',
  homepage: 'https://libwebsockets.org',
  github: 'https://github.com/warmcat/libwebsockets',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'warmcat/libwebsockets',
  },
  distributable: {
    url: 'https://github.com/warmcat/libwebsockets/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libuv.org': '1',
    'libevent.org': '2',
  },
  buildDependencies: {
    'cmake.org': '3',
  },

  build: {
    workingDirectory: 'build',
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        'working-directory': '{{prefix}}/lib/cmake/libwebsockets',
        run: [
          'sed -E -i.bak \\',
          '  -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../..:g" \\',
          // eslint-disable-next-line no-super-linear-backtracking -- sed script string, not a JS regex
          '  -e \'/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)[0-9.]*[a-z]?/include|/v\\1/include|g\' \\',
          // eslint-disable-next-line no-super-linear-backtracking -- sed script string, not a JS regex
          '  -e \'/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)[0-9.]*[a-z]?/lib|/v\\1/lib|g\' \\',
          '  LibwebsocketsTargets.cmake',
          '',
          'sed -E -i.bak \\',
          '  -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../..:g" \\',
          // eslint-disable-next-line no-super-linear-backtracking -- sed script string, not a JS regex
          '  -e \'/^set\\(LIBWEBSOCKETS_INCLUDE_DIRS/ s|/v([0-9]+)[0-9.]*[a-z]?/include|/v\\1/include|g\' \\',
          '  libwebsockets-config.cmake',
          '',
          'rm LibwebsocketsTargets.cmake.bak libwebsockets-config.cmake.bak',
        ].join('\n'),
      },
    ],
    env: {
      'ARGS': ['-DLWS_IPV6=ON', '-DLWS_WITH_HTTP2=ON', '-DLWS_WITH_LIBEVENT=ON', '-DLWS_WITH_LIBUV=ON', '-DLWS_WITH_PLUGINS=ON', '-DLWS_WITHOUT_TESTAPPS=ON', '-DLWS_UNIX_SOCK=ON'],
    },
  },
}
