import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'figma.com',
  name: 'Figma',
  description: 'A collaborative interface design tool.',
  homepage: 'https://figma.com',
  programs: ['figma'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL "https://desktop.figma.com/mac-arm/Figma-{{version}}.zip" -o /tmp/figma.zip',
      'cd /tmp && unzip -qo figma.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/Figma.app" "{{prefix}}/Figma.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Figma.app/Contents/MacOS/Figma" "{{prefix}}/bin/figma"',
    ],
  },
}
