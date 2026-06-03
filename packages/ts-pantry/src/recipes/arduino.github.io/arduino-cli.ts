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
    url: 'https://github.com/arduino/arduino-cli/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '"$SRCROOT"/install.sh {{version}}',
    ],
  },
}
