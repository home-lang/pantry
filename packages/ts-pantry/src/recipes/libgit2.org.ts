import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libgit2.org',
  name: 'git2',
  description: 'A cross-platform, linkable library implementation of Git that you can use in your application.',
  homepage: 'https://libgit2.github.com/',
  github: 'https://github.com/libgit2/libgit2',
  programs: ['git2'],
  versionSource: {
    type: 'github-releases',
    repo: 'libgit2/libgit2',
  },
  distributable: {
    url: 'https://github.com/libgit2/libgit2/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libssh2.org': '^1',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['-DBUILD_EXAMPLES=OFF', '-DBUILD_TESTS=OFF', '-DUSE_SSH=ON', '-DBUILD_SHARED_LIBS=ON', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
