import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'telegram.org',
  name: 'Telegram',
  description: 'A cloud-based messaging app with a focus on speed and security.',
  homepage: 'https://telegram.org',
  programs: ['telegram'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'curl -fSL -L "https://osx.telegram.org/updates/Telegram.dmg" -o /tmp/telegram.dmg',
    'hdiutil attach /tmp/telegram.dmg -mountpoint /tmp/telegram-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/telegram-mount/Telegram.app" "{{prefix}}/Telegram.app"',
    'hdiutil detach /tmp/telegram-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Telegram.app/Contents/MacOS/Telegram" "{{prefix}}/bin/telegram"',
    ],
  },
}
