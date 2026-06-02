import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/vlang.io',
  domain: 'vlang.io',
  name: 'v',
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io',
  github: 'https://github.com/vlang/v',
  programs: ['v'],
  versionSource: {
    // Track V's STABLE tagged releases (e.g. 0.5.1) only — the repo also
    // publishes unstable `weekly.YYYY.WW` snapshots as GitHub releases, and
    // those broke the source build (e.g. weekly.2026.08 fails to compile with
    // an upstream `vlib/builtin/float.c.v` `$if` error). The tagPattern keeps
    // resolution on semver-style stable tags.
    type: 'github-releases',
    repo: 'vlang/v',
    tagPattern: /^(\d+\.\d+(?:\.\d+)?)$/,
  },
  distributable: {
    url: 'https://github.com/vlang/v/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'git-scm.org': '*',
  },

  build: {
    script: [
      // fixed in https://github.com/vlang/v/commit/ca484430e0380a3fc591b842aadda4fe18deaae5
      { run: 'git apply props/int-types.diff', if: '=0.3.2' },

      // V bootstraps by compiling `vc/v.c` (a generated C snapshot of the V
      // compiler) into `v1`, then uses `v1` to compile the stdlib + cmd/v.
      // `make` normally clones `vlang/vc` at its HEAD, which always tracks
      // V *master*. Building an older *stable* tag (0.5.1) with a master vc
      // is a version skew: master removed the `native` comptime ident, so the
      // master bootstrap `v1` rejects the 0.5.1 stdlib's `$if !native {` with
      //   vlib/builtin/float.c.v: error: invalid $if condition: unknown indent `native`
      // Fix: pin vc to the commit generated from the exact 0.5.1 V commit
      // (`[v:master] 0c3183c5… - V 0.5.1`) and build with `local=1` so the
      // makefile uses our pinned ./vc instead of pulling HEAD.
      {
        run: 'git clone --filter=blob:none --quiet https://github.com/vlang/vc vc && git -C vc checkout --quiet f461dfebcdfac3c75fdf28fec80c07f0a7a9a53d',
        if: '=0.5.1',
      },

      // `local=1` makes the makefile use the pinned ./vc, but it ALSO skips the
      // tccbin fetch — and that's not optional here: V's final binary links the
      // Boehm GC archive shipped in `thirdparty/tcc/lib/libgc.a` (V defaults to
      // `-gc boehm`), so without it `prod=1` fails at link with
      //   ld: cannot find thirdparty/tcc/lib/libgc.a: No such file or directory
      // Fetch the platform-correct tccbin explicitly first, then do the pinned
      // local build so ./vc stays pinned while libgc.a is present.
      { run: 'make latest_tcc', if: '=0.5.1' },
      { run: 'make local=1 prod=1', if: '=0.5.1' },
      // Any other stable tag ships a matching master vc, so the default
      // HEAD-tracking bootstrap works again.
      { run: 'make prod=1', if: '<0.5.1 || >0.5.1' },

      'mkdir -p {{prefix}}/libexec',
      'cp -R cmd thirdparty v v.mod vlib {{prefix}}/libexec/',

      { run: 'ln -s ../libexec/v v', 'working-directory': '{{prefix}}/bin' },
    ],
  },
}
