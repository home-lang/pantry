import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/krzysztofzablocki/Sourcery',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'Sourcery',
  programs: [
    'sourcery',
  ],
  distributable: {
    url: 'https://github.com/krzysztofzablocki/Sourcery/releases/download/{{version}}/Sourcery-{{version}}.zip',
  },
  build: {
    script: [
      'test -f "$SRCROOT"/bin/sourcery && install "$SRCROOT"/bin/sourcery .',
      'test -f "$SRCROOT"/sourcery-{{version}}/bin/sourcery && install "$SRCROOT"/sourcery-{{version}}/bin/sourcery .',
      'test -f sourcery',
    ],
  },
  test: {
    script: [
      'test "$(sourcery --version)" = "{{version}}"',
      'sourcery --version',
    ],
  },
}
