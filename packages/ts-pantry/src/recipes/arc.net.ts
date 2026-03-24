import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'arc.net',
  name: 'Arc',
  description: 'A Chromium-based web browser with a focus on design and productivity.',
  homepage: 'https://arc.net',
  programs: ['arc'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL "https://releases.arc.net/release/Arc-latest.dmg" -o /tmp/arc.dmg',
      'hdiutil attach /tmp/arc.dmg -mountpoint /tmp/arc-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/arc-mount/Arc.app" "{{prefix}}/Arc.app"',
      'hdiutil detach /tmp/arc-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Arc.app/Contents/MacOS/Arc" "{{prefix}}/bin/arc"',
    ],
  },
}
