import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'inkscape.org',
  name: 'Inkscape',
  description: 'A professional vector graphics editor.',
  homepage: 'https://inkscape.org',
  programs: ['inkscape'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
    'BREW_URL=$(brew info --cask --json=v2 inkscape 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
    'if [ -n "$BREW_URL" ]; then',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/inkscape.dmg',
    'else',
    '  echo "brew cask info unavailable for inkscape, using fallback"',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://media.inkscape.org/dl/resources/file/Inkscape-{{version}}_arm64.dmg" -o /tmp/inkscape.dmg',
    'fi',
    'hdiutil attach /tmp/inkscape.dmg -mountpoint /tmp/inkscape-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/inkscape-mount/Inkscape.app" "{{prefix}}/Inkscape.app" 2>/dev/null || \\',
    '  find /tmp/inkscape-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
    'hdiutil detach /tmp/inkscape-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Inkscape.app/Contents/MacOS/inkscape" "{{prefix}}/bin/inkscape"',
    ],
  },
}
