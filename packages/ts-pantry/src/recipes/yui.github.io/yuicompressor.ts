import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'yui.github.io/yuicompressor',
  name: 'yuicompressor',
  programs: [
    'yuicompressor',
  ],
  dependencies: {
    'openjdk.org': '*',
  },
  distributable: {
    url: 'https://github.com/yui/yuicompressor/releases/download/v{{version}}/yuicompressor-{{version}}.zip',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'echo -e \'#!/bin/bash\\njava -jar $(dirname "$0")/yuicompressor-{{version}}.jar $@\' > ./yuicompressor',
      'install yuicompressor-{{version}}.jar yuicompressor {{prefix}}/bin/',
    ],
  },
  test: {
    script: [
      'yuicompressor --nomunge --preserve-semi ./test.js | grep \'var i=1;console.log(i);\'',
    ],
  },
}
