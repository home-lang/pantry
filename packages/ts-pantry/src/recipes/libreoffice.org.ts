import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'libreoffice.org',
  name: 'LibreOffice',
  description: 'A free and powerful office suite.',
  homepage: 'https://libreoffice.org',
  programs: ['libreoffice'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
    'BREW_URL=$(brew info --cask --json=v2 libreoffice 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
    'if [ -n "$BREW_URL" ]; then',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/libreoffice.dmg',
    'else',
    '  echo "brew cask info unavailable for libreoffice, using fallback"',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://download.documentfoundation.org/libreoffice/stable/{{version}}/mac/aarch64/LibreOffice_{{version}}_MacOS_aarch64.dmg" -o /tmp/libreoffice.dmg',
    'fi',
    'hdiutil attach /tmp/libreoffice.dmg -mountpoint /tmp/libreoffice-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/libreoffice-mount/LibreOffice.app" "{{prefix}}/LibreOffice.app" 2>/dev/null || \\',
    '  find /tmp/libreoffice-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
    'hdiutil detach /tmp/libreoffice-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../LibreOffice.app/Contents/MacOS/soffice" "{{prefix}}/bin/libreoffice"',
    ],
  },
}
