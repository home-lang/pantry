import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'signal.org',
  name: 'Signal',
  description: 'A private messenger for encrypted communications.',
  homepage: 'https://signal.org',
  programs: ['signal'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'curl -fSL -L "https://updates.signal.org/desktop/signal-desktop-mac-universal-{{version}}.dmg" -o /tmp/signal.dmg',
    'hdiutil attach /tmp/signal.dmg -mountpoint /tmp/signal-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/signal-mount/Signal.app" "{{prefix}}/Signal.app"',
    'hdiutil detach /tmp/signal-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Signal.app/Contents/MacOS/Signal" "{{prefix}}/bin/signal"',
    ],
  },
}
