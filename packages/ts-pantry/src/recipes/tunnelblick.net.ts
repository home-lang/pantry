import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tunnelblick.net',
  name: 'Tunnelblick',
  description: 'A free, open-source graphic user interface for OpenVPN on macOS.',
  homepage: 'https://tunnelblick.net',
  programs: ['tunnelblick'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
    'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
    'BREW_URL=$(brew info --cask --json=v2 tunnelblick 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
    'if [ -n "$BREW_URL" ]; then',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/tunnelblick.dmg',
    'else',
    '  echo "brew cask info unavailable for tunnelblick, using fallback"',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://github.com/Tunnelblick/Tunnelblick/releases/latest/download/Tunnelblick.dmg" -o /tmp/tunnelblick.dmg',
    'fi',
    'hdiutil attach /tmp/tunnelblick.dmg -mountpoint /tmp/tunnelblick-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/tunnelblick-mount/Tunnelblick.app" "{{prefix}}/Tunnelblick.app" 2>/dev/null || \\',
    '  find /tmp/tunnelblick-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
    'hdiutil detach /tmp/tunnelblick-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Tunnelblick.app/Contents/MacOS/Tunnelblick" "{{prefix}}/bin/tunnelblick"',
    ],
  },
}
