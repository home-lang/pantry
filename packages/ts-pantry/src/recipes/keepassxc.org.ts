import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'keepassxc.org',
  name: 'KeePassXC',
  description: 'A cross-platform community-driven password manager.',
  homepage: 'https://keepassxc.org',
  programs: ['keepassxc'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'curl -fSL -L "https://github.com/keepassxreboot/keepassxc/releases/download/{{version}}/KeePassXC-{{version}}-arm64.dmg" -o /tmp/keepassxc.dmg',
    'hdiutil attach /tmp/keepassxc.dmg -mountpoint /tmp/keepassxc-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/keepassxc-mount/KeePassXC.app" "{{prefix}}/KeePassXC.app"',
    'hdiutil detach /tmp/keepassxc-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../KeePassXC.app/Contents/MacOS/KeePassXC" "{{prefix}}/bin/keepassxc"',
    ],
  },
}
