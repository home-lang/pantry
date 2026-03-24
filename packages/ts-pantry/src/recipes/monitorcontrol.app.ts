import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'monitorcontrol.app',
  name: 'MonitorControl',
  description: 'A tool to control external monitor brightness and volume on macOS.',
  homepage: 'https://github.com/MonitorControl/MonitorControl',
  programs: ['monitorcontrol'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 monitorcontrol 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/monitorcontrol.dmg',
      'else',
      '  echo "brew cask info unavailable for monitorcontrol, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://github.com/MonitorControl/MonitorControl/releases/latest/download/MonitorControl.dmg" -o /tmp/monitorcontrol.dmg',
      'fi',
      'hdiutil attach /tmp/monitorcontrol.dmg -mountpoint /tmp/monitorcontrol-mount -nobrowse -noverify -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/monitorcontrol-mount/MonitorControl.app" "{{prefix}}/MonitorControl.app" 2>/dev/null || \\',
      '  find /tmp/monitorcontrol-mount -maxdepth 1 -name "*.app" -exec cp -R {} "{{prefix}}/" \\;',
      'hdiutil detach /tmp/monitorcontrol-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../MonitorControl.app/Contents/MacOS/MonitorControl" "{{prefix}}/bin/monitorcontrol"',
    ],
  },
}
