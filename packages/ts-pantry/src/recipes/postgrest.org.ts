import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'postgrest.org',
  name: 'postgrest',
  description: 'Serves a fully RESTful API from any existing PostgreSQL database',
  homepage: 'https://postgrest.org',
  github: 'https://github.com/PostgREST/postgrest',
  programs: ['postgrest'],
  // Prebuilt download: PostgREST is a Haskell program (very slow/hard to compile
  // from source). Upstream ships official per-platform release archives
  // (`postgrest-v<ver>-<suffix>.tar.xz`). The suffix naming shifted at v13:
  //   linux x86-64 : linux-static-x86-64 (v13+) | linux-static-x64 (<=v12)
  //   linux aarch64: ubuntu-aarch64      (all versions, v10+)
  //   darwin x86-64: macos-x86-64        (v13+) | macos-x64         (<=v12)
  //   darwin aarch64: macos-aarch64      (v13+ only — native arm64; older
  //                                       releases ship only a Rosetta x64 macos
  //                                       build, so darwin/aarch64 is v13+)
  versionSource: {
    type: 'github-releases',
    repo: 'PostgREST/postgrest',
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) SUFFIXES="macos-aarch64" ;;',
      '  darwin+x86-64)  SUFFIXES="macos-x86-64 macos-x64" ;;',
      '  linux+aarch64)  SUFFIXES="ubuntu-aarch64" ;;',
      '  linux+x86-64)   SUFFIXES="linux-static-x86-64 linux-static-x64" ;;',
      'esac',
      '',
      'mkdir -p {{prefix}}/bin',
      'BASE="https://github.com/PostgREST/postgrest/releases/download/v{{version}}/postgrest-v{{version}}"',
      'OK=0',
      'for S in $SUFFIXES; do',
      '  if curl -fSL "${BASE}-${S}.tar.xz" | tar xJ -C {{prefix}}/bin; then OK=1; break; fi',
      'done',
      '[ "$OK" = "1" ] || { echo "no prebuilt asset found"; exit 1; }',
      'chmod +x {{prefix}}/bin/postgrest',
    ],
  },

  test: {
    script: [
      'postgrest --version',
    ],
  },
}
