import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'spawn.link',
  name: 'spawn.link',
  description: 'a featureful union filesystem',
  homepage: 'https://trapexit.github.io/mergerfs/',
  github: 'https://github.com/trapexit/mergerfs',
  programs: ['mergerfs', 'mergerfs-fusermount', 'mount.mergerfs'],
  platforms: ['linux'],
  versionSource: {
    type: 'github-releases',
    repo: 'trapexit/mergerfs',
  },
  distributable: {
    url: 'https://github.com/trapexit/mergerfs/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'git-scm.org': '*',
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      // Set the version
      {
        run: 'sed -i -e \'s/^VERSION=.*/VERSION={{version}}/\' update-version',
        if: '<2.39',
        'working-directory': 'tools',
      },
      {
        run: 'sed -i -e \'s/^VERSION=.*/VERSION={{version}}/\' update-version',
        if: '>=2.39',
        'working-directory': 'buildtools',
      },

      // Don't try to chown/chmod on install
      {
        run: 'sed -i -e \'/\\(chown\\|chmod\\|CHOWN\\|CHMOD\\)/d\' libfuse/Makefile',
        if: '<2.42',
      },
      {
        run: 'sed -i -e \'/\\(chown\\|chmod\\|CHOWN\\|CHMOD\\)/d\' vendored/libfuse/Makefile',
        if: '>=2.42',
      },

      'make --jobs {{hw.concurrency}}',
      'make install DESTDIR={{prefix}} PREFIX=""',
    ],
    env: {
      'CFLAGS': '-Wno-implicit-function-declaration',
      'CC': 'clang',
      'CXX': 'clang++',
      // since 2.41.0
      'linux': {
        LDFLAGS: '-Wl,-lstdc++fs',
      },
    },
  },
}
