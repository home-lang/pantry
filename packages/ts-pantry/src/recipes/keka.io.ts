import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'keka.io',
  name: 'Keka',
  description: 'A file archiver for macOS.',
  homepage: 'https://keka.io',
  programs: ['keka'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL -L "https://github.com/aonez/Keka/releases/download/v{{version}}/Keka-{{version}}.dmg" -o /tmp/keka.dmg',
      'hdiutil attach /tmp/keka.dmg -mountpoint /tmp/keka-mount -nobrowse -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/keka-mount/Keka.app" "{{prefix}}/Keka.app"',
      'hdiutil detach /tmp/keka-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Keka.app/Contents/MacOS/Keka" "{{prefix}}/bin/keka"',
    ],
  },
}
