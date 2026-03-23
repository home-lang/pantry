import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'hiddenbar.app',
  name: 'Hidden Bar',
  description: 'A utility to hide menu bar items on macOS.',
  homepage: 'https://github.com/dwarvesf/hidden',
  programs: ['hiddenbar'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 hiddenbar 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/hiddenbar.zip',
      'else',
      '  echo "brew cask info unavailable for hiddenbar, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://github.com/dwarvesf/hidden/releases/latest/download/Hidden.Bar.zip" -o /tmp/hiddenbar.zip',
      'fi',
      'cd /tmp && unzip -qo hiddenbar.zip',
      'mkdir -p "{{prefix}}"',
      'find /tmp -maxdepth 1 -name "Hidden*Bar*.app" -exec mv {} "{{prefix}}/Hidden Bar.app" \\;',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Hidden Bar.app/Contents/MacOS/Hidden Bar" "{{prefix}}/bin/hiddenbar"',
    ],
  },
}
