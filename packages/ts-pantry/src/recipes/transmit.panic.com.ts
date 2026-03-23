import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'transmit.panic.com',
  name: 'Transmit',
  description: 'A file transfer client for macOS.',
  homepage: 'https://panic.com/transmit',
  programs: ['transmit'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 transmit 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/transmit.zip',
      'else',
      '  echo "brew cask info unavailable for transmit, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://download.panic.com/transmit/Transmit%205.zip" -o /tmp/transmit.zip',
      'fi',
      'cd /tmp && unzip -qo transmit.zip',
      'mkdir -p "{{prefix}}"',
      'find /tmp -maxdepth 1 -name "Transmit*.app" -exec mv {} "{{prefix}}/Transmit.app" \\;',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Transmit.app/Contents/MacOS/Transmit" "{{prefix}}/bin/transmit"',
    ],
  },
}
