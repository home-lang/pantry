import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
      'if [ "$OS" = "darwin" ] && [ "$ARCH" = "arm64" ]; then',
      '  SUFFIX="macos-aarch64"',
      'elif [ "$OS" = "linux" ] && [ "$ARCH" = "x86_64" ]; then',
      '  SUFFIX="linux-static-x86-64"',
      'else',
      '  echo "Unsupported platform: $OS/$ARCH" && exit 1',
      'fi',
      'mkdir -p "{{prefix}}/bin"',
      'curl -fSL "https://github.com/PostgREST/postgrest/releases/download/v{{version.marketing}}/postgrest-v{{version.marketing}}-${SUFFIX}.tar.xz" | tar xJ -C "{{prefix}}/bin"',
      'chmod +x "{{prefix}}/bin/postgrest"',
    ],
  },
}
