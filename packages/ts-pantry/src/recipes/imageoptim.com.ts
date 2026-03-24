import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'imageoptim.com',
  name: 'ImageOptim',
  description: 'An image optimizer for macOS.',
  homepage: 'https://imageoptim.com',
  programs: ['imageoptim'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL -L "https://imageoptim.com/ImageOptim.tbz2" -o /tmp/imageoptim.tbz2',
      'cd /tmp && tar xjf imageoptim.tbz2',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/ImageOptim.app" "{{prefix}}/ImageOptim.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../ImageOptim.app/Contents/MacOS/ImageOptim" "{{prefix}}/bin/imageoptim"',
    ],
  },
}
