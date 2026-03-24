import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'warp.dev',
  name: 'Warp',
  description: 'A modern, Rust-based terminal with AI built in.',
  homepage: 'https://warp.dev',
  programs: ['warp'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL "https://app.warp.dev/download?package=dmg" -L -o /tmp/warp.dmg',
      'hdiutil attach /tmp/warp.dmg -mountpoint /tmp/warp-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/warp-mount/Warp.app" "{{prefix}}/Warp.app"',
      'hdiutil detach /tmp/warp-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Warp.app/Contents/MacOS/stable" "{{prefix}}/bin/warp"',
    ],
  },
}
