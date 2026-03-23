import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    url: 'https://github.com/trapexit/mergerfs/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'git-scm.org': '*',
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'cd "tools"',
      'sed -i -e \'s/^VERSION=.*/VERSION={{ version }}/\' update-version',
      'cd "buildtools"',
      'sed -i -e \'s/^VERSION=.*/VERSION={{ version }}/\' update-version',
      'sed -i -e \'/\\(chown\\|chmod\\|CHOWN\\|CHMOD\\)/d\' libfuse/Makefile',
      'make --jobs {{ hw.concurrency }}',
      'make install DESTDIR="{{prefix}}" PREFIX=""',
    ],
    env: {
      'CFLAGS': '-Wno-implicit-function-declaration',
      'CC': 'clang',
      'CXX': 'clang++',
    },
  },
}
