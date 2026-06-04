import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thom311/libnl',
  name: 'libnl',
  programs: [],
  buildDependencies: {
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
    // bison shells out to `m4` to expand its parser skeletons. Without a
    // reachable m4 it parses the .y (emitting the deprecated-directive
    // warnings) and then dies with "m4 subprocess failed", which surfaces as
    // `make: *** [lib/route/pktloc_syntax.c] Error 1`. Declare m4 directly so a
    // known-good binary is provisioned and PATH-prepended for the build.
    'gnu.org/m4': '*',
  },
  distributable: {
    url: 'https://github.com/thom311/libnl/releases/download/libnl{{version.major}}_{{version.minor}}_{{version.patch}}/libnl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // Pin the m4 bison invokes for its skeleton expansion to a binary we know
      // resolves on PATH; bare `m4` can get lost to env scrubbing during the
      // parallel parser-generation step and bison then fails the subprocess.
      'export M4="$(command -v m4)"',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'gcc ./fixture.c -lnl-3 -lnl-route-3 -o test',
      '(./test 2>&1 || true) | grep "$OUT"',
      'nl-route-list | grep "$OUT2"',
    ],
  },
}
