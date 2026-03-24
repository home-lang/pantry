import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lmstudio.ai',
  name: 'LM Studio',
  description: 'A desktop app for discovering, downloading, and running local LLMs.',
  homepage: 'https://lmstudio.ai',
  programs: ['lm-studio'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 lm-studio 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/lmstudio.dmg',
      'else',
      '  echo "brew cask info unavailable for lm-studio, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://releases.lmstudio.ai/latest/mac/arm64" -o /tmp/lmstudio.dmg',
      'fi',
      'hdiutil attach /tmp/lmstudio.dmg -mountpoint /tmp/lm-studio-mount -nobrowse -noverify -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/lm-studio-mount/LM Studio.app" "{{prefix}}/LM Studio.app" 2>/dev/null || \\',
      '  find /tmp/lm-studio-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
      'hdiutil detach /tmp/lm-studio-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../LM Studio.app/Contents/MacOS/LM Studio" "{{prefix}}/bin/lm-studio"',
    ],
  },
}
