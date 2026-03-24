import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'blender.org',
  name: 'Blender',
  description: 'A free and open-source 3D creation suite.',
  homepage: 'https://blender.org',
  programs: ['blender'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL -L "https://download.blender.org/release/Blender{{version.marketing}}/blender-{{version}}-macos-arm64.dmg" -o /tmp/blender.dmg',
      'hdiutil attach /tmp/blender.dmg -mountpoint /tmp/blender-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/blender-mount/Blender.app" "{{prefix}}/Blender.app"',
      'hdiutil detach /tmp/blender-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Blender.app/Contents/MacOS/Blender" "{{prefix}}/bin/blender"',
    ],
  },
}
