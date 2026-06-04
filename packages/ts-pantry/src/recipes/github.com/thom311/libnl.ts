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
      // Pin the m4 bison shells out to for skeleton expansion to whatever
      // resolves on PATH, so the parser-generation step never dies with
      // "m4 subprocess failed".
      'export M4="$(command -v m4)"',
      './configure $ARGS',
      // libnl's Makefile has a parallel-build race: the flex/bison rules emit
      // ematch_syntax.h / pktloc_syntax.h, but ematch.c / pktloc.c that
      // #include them can start compiling before those headers exist, failing
      // with "ematch_syntax.h: No such file or directory". Generate the parser
      // sources + headers serially first, then run the parallel build.
      'make lib/route/pktloc_syntax.c lib/route/pktloc_grammar.c lib/route/cls/ematch_syntax.c lib/route/cls/ematch_grammar.c',
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
