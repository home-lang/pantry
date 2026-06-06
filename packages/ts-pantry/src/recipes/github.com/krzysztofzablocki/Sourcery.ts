import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/krzysztofzablocki/Sourcery',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'Sourcery',
  programs: [
    'sourcery',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'krzysztofzablocki/Sourcery',
  },
  distributable: null,
  build: {
    script: [
      'ASSET=sourcery-{{version}}.zip',
      'curl -Lfo "$ASSET" "https://github.com/krzysztofzablocki/Sourcery/releases/download/{{version}}/$ASSET"',
      'unzip -q "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 bin/sourcery {{prefix}}/bin/sourcery',
    ],
  },
  test: {
    script: [
      'test "$(sourcery --version)" = "{{version}}"',
      'sourcery --version',
    ],
  },
}
