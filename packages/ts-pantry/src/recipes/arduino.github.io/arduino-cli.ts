import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'arduino.github.io/arduino-cli',
  name: 'arduino-cli',
  programs: [
    'arduino-cli',
  ],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: {
    url: 'https://github.com/arduino/arduino-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': '{{prefix}}',
    script: [
      '"$SRCROOT"/install.sh {{version}}',
    ],
  },
}
