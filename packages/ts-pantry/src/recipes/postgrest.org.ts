import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'postgrest.org',
  name: 'postgrest',
  description: 'Serves a fully RESTful API from any existing PostgreSQL database',
  homepage: 'https://postgrest.org',
  github: 'https://github.com/PostgREST/postgrest',
  programs: ['postgrest'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'PostgREST/postgrest',
  },

  build: {
    script: [
      'OS=$(uname -s | tr "[:upper:]" "[:lower:]")',
      'ARCH=$(uname -m)',
      '# Asset naming changed at v12: older releases use the "*-x64" suffix and',
      '# only ship a macos x64 (Rosetta) build, newer ones use "*-x86-64" plus',
      '# native macos-aarch64. Try the candidate suffixes in order.',
      'if [ "$OS" = "darwin" ]; then',
      '  SUFFIXES="macos-aarch64 macos-x64"',
      'elif [ "$OS" = "linux" ] && [ "$ARCH" = "x86_64" ]; then',
      '  SUFFIXES="linux-static-x86-64 linux-static-x64"',
      'else',
      '  echo "Unsupported platform: $OS/$ARCH" && exit 1',
      'fi',
      'mkdir -p {{prefix}}/bin',
      'BASE="https://github.com/PostgREST/postgrest/releases/download/v{{version.marketing}}/postgrest-v{{version.marketing}}"',
      'OK=0',
      'for S in $SUFFIXES; do',
      '  if curl -fSL "${BASE}-${S}.tar.xz" | tar xJ -C {{prefix}}/bin; then OK=1; break; fi',
      'done',
      '[ "$OK" = "1" ] || { echo "no prebuilt asset found"; exit 1; }',
      'chmod +x {{prefix}}/bin/postgrest',
    ],
  },
}
