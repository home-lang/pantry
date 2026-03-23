import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cursor.com',
  name: 'Cursor',
  description: 'An AI-first code editor built for pair programming.',
  homepage: 'https://cursor.com',
  programs: ['cursor'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    '# Cursor downloads as ZIP or DMG depending on brew version — handle both',
    'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
    'BREW_URL=$(brew info --cask --json=v2 cursor 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
    'if [ -n "$BREW_URL" ]; then',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/cursor-download',
    'else',
    '  echo "brew cask info unavailable for cursor, using fallback"',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://downloads.cursor.com/production/latest/darwin/arm64/Cursor-darwin-arm64.zip" -o /tmp/cursor-download',
    'fi',
    'cd /tmp',
    'if file cursor-download | grep -q "Zip archive"; then',
    '  mv cursor-download cursor.zip && unzip -qo cursor.zip',
    'elif file cursor-download | grep -q "Apple Disk Image\\|VAX COFF"; then',
    '  mv cursor-download cursor.dmg && hdiutil attach cursor.dmg -mountpoint /tmp/cursor-mount -nobrowse -noverify -quiet && cp -R "/tmp/cursor-mount/Cursor.app" /tmp/ && hdiutil detach /tmp/cursor-mount -quiet || true',
    'fi',
    'mkdir -p "{{prefix}}"',
    'find /tmp -maxdepth 1 -name "Cursor.app" -exec mv {} "{{prefix}}/Cursor.app" \\;',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Cursor.app/Contents/Resources/app/bin/cursor" "{{prefix}}/bin/cursor"',
    ],
  },
}
