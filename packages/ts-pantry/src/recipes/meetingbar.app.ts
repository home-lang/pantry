import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'meetingbar.app',
  name: 'MeetingBar',
  description: 'A menu bar app for your calendar meetings.',
  homepage: 'https://meetingbar.app',
  programs: ['meetingbar'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
    '# MeetingBar is a DMG from GitHub releases',
    'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
    'BREW_URL=$(brew info --cask --json=v2 meetingbar 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
    'if [ -n "$BREW_URL" ]; then',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/meetingbar.dmg',
    'else',
    '  echo "brew cask info unavailable for meetingbar, using fallback"',
    '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://github.com/leits/MeetingBar/releases/latest/download/MeetingBar.dmg" -o /tmp/meetingbar.dmg',
    'fi',
    'hdiutil attach /tmp/meetingbar.dmg -mountpoint /tmp/meetingbar-mount -nobrowse -noverify -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/meetingbar-mount/MeetingBar.app" "{{prefix}}/MeetingBar.app" 2>/dev/null || \\',
    '  find /tmp/meetingbar-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
    'hdiutil detach /tmp/meetingbar-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../MeetingBar.app/Contents/MacOS/MeetingBar" "{{prefix}}/bin/meetingbar"',
    ],
  },
}
