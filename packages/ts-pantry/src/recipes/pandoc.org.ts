import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pandoc.org',
  name: 'pandoc',
  description: 'Swiss-army knife of markup format conversion',
  homepage: 'https://pandoc.org/',
  github: 'https://github.com/jgm/pandoc',
  programs: ['pandoc'],
  versionSource: {
    type: 'github-releases',
    repo: 'jgm/pandoc',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'OS=$(uname -s)',
    'ARCH=$(uname -m)',
    'mkdir -p "{{prefix}}/bin" "{{prefix}}/share/man/man1"',
    'if [ "$OS" = "Darwin" ]; then',
    '  case "$ARCH" in',
    '    arm64) ZIP="pandoc-{{version.marketing}}-arm64-macOS.zip" ;;',
    '    x86_64) ZIP="pandoc-{{version.marketing}}-x86_64-macOS.zip" ;;',
    '  esac',
    '  curl -fSL -o /tmp/pandoc.zip "https://github.com/jgm/pandoc/releases/download/{{version.marketing}}/$ZIP"',
    '  unzip -o /tmp/pandoc.zip -d /tmp/pandoc-extract',
    '  cp /tmp/pandoc-extract/*/bin/pandoc "{{prefix}}/bin/"',
    '  cp /tmp/pandoc-extract/*/share/man/man1/*.1* "{{prefix}}/share/man/man1/" 2>/dev/null || true',
    'else',
    '  case "$ARCH" in',
    '    x86_64) TARNAME="pandoc-{{version.marketing}}-linux-amd64.tar.gz" ;;',
    '    aarch64) TARNAME="pandoc-{{version.marketing}}-linux-arm64.tar.gz" ;;',
    '  esac',
    '  curl -fSL "https://github.com/jgm/pandoc/releases/download/{{version.marketing}}/$TARNAME" | tar xz --strip-components=1 -C "{{prefix}}"',
    'fi',
    'chmod +x "{{prefix}}/bin/pandoc"',
    ],
  },
}
