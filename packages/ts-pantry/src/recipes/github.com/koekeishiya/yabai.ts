import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/koekeishiya/yabai',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'yabai',
  programs: [
    'yabai',
  ],
  distributable: {
    url: 'https://github.com/koekeishiya/yabai/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make',
      'install -D bin/yabai {{prefix}}/bin/yabai',
      'install -D doc/yabai.1 {{prefix}}/man/man1/yabai.1',
    ],
  },
  test: {
    script: [
      'yabai --help',
      'test "$(yabai --version)" = "yabai-v{{version}}"',
    ],
  },
}
