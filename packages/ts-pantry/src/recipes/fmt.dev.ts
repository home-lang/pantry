import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fmt.dev',
  name: 'fmt',
  description: 'A modern formatting library',
  homepage: 'https://fmt.dev',
  github: 'https://github.com/fmtlib/fmt',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'fmtlib/fmt',
  },
  distributable: {
    url: 'https://github.com/fmtlib/fmt/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake . -B build $ARGS -DBUILD_SHARED_LIBS=ON',
      'cd "build"',
      'make --jobs {{hw.concurrency}} install',
      'cmake . -B build-static $ARGS -DBUILD_SHARED_LIBS=OFF',
      'cd "build-static"',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
