import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'doxygen.nl',
  name: 'doxygen',
  description: 'Generate documentation for several programming languages',
  homepage: 'https://www.doxygen.nl/',
  github: 'https://github.com/doxygen/doxygen',
  programs: ['doxygen'],
  versionSource: {
    type: 'github-releases',
    repo: 'doxygen/doxygen',
    tagPattern: /^Doxygen release (.+)$/,
  },
  distributable: {
    url: 'https://github.com/doxygen/doxygen/archive/refs/tags/Release_{{version.major}}_{{version.minor}}_{{version.patch}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/bison': '^3',
    'cmake.org': '^3',
    'github.com/westes/flex': '2',
    'python.org': '>=3<3.12',
    'linux': {
      'llvm.org': '20',
    },
  },

  build: {
    workingDirectory: 'build',
    script: [
      // macOS ships an ancient system bison (2.3) at /usr/bin/bison, but doxygen's
      // CMakeLists requires bison >= 2.7. There is no gnu.org/bison recipe in the
      // registry and the macOS CI brew list does not preinstall bison, so without
      // this CMake picks /usr/bin/bison 2.3 and fails the version check.
      // Install a modern bison via Homebrew and put it first on PATH (keg-only, so
      // its bin is not symlinked into /opt/homebrew/bin by default). flex already
      // comes from brew on macOS, so only bison needs handling here. Linux uses the
      // apt-installed bison 3.x and is unaffected.
      {
        run: [
          'brew install bison || true',
          'BISON_PREFIX="$(brew --prefix bison 2>/dev/null || true)"',
          'if [ -n "$BISON_PREFIX" ] && [ -x "$BISON_PREFIX/bin/bison" ]; then',
          '  export PATH="$BISON_PREFIX/bin:$PATH"',
          '  ARGS="$ARGS -DBISON_EXECUTABLE=$BISON_PREFIX/bin/bison"',
          'fi',
        ],
        if: 'darwin',
      },
      'cmake $ARGS -G "Unix Makefiles" ..',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
