import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'whatsapp.com',
  name: 'WhatsApp',
  description: 'A messaging app for simple, reliable, and private communication.',
  homepage: 'https://whatsapp.com',
  programs: ['whatsapp'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      '# WhatsApp downloads as ZIP',
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 whatsapp 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/whatsapp.zip',
      'else',
      '  echo "brew cask info unavailable for whatsapp, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://web.whatsapp.com/desktop/mac_native/release/?extension=zip&configuration=Release" -o /tmp/whatsapp.zip',
      'fi',
      'cd /tmp && unzip -qo whatsapp.zip',
      'mkdir -p "{{prefix}}"',
      'find /tmp -maxdepth 1 -name "WhatsApp.app" -exec mv {} "{{prefix}}/WhatsApp.app" \\;',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../WhatsApp.app/Contents/MacOS/WhatsApp" "{{prefix}}/bin/whatsapp"',
    ],
  },
}
