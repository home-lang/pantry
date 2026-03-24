import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'the-unarchiver.com',
  name: 'The Unarchiver',
  description: 'A multi-format archive decompressor for macOS.',
  homepage: 'https://theunarchiver.com',
  programs: ['unar', 'lsar'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL -L "https://cdn.theunarchiver.com/downloads/TheUnarchiver.zip" -o /tmp/unarchiver.zip',
      'cd /tmp && unzip -qo unarchiver.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/The Unarchiver.app" "{{prefix}}/The Unarchiver.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../The Unarchiver.app/Contents/MacOS/unar" "{{prefix}}/bin/unar"',
      'ln -sf "../The Unarchiver.app/Contents/MacOS/lsar" "{{prefix}}/bin/lsar"',
    ],
  },
}
