import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/crc-org/vfkit',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'vfkit',
  programs: [
    'vfkit',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/crc-org/vfkit/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make GIT_VERSION={{version}}',
      'mkdir -p \'{{prefix}}/bin\'',
      'cp out/vfkit \'{{prefix}}/bin\'',
    ],
  },
  test: {
    script: [
      'test "$(vfkit --version | head -n1)" = "vfkit version: {{version}}"',
      'test "$(vfkit --version | head -n1)" = "vfkit version: v{{version}}"',
    ],
  },
}
