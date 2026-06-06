import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mac-cain13/R.swift',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'R',
  programs: [
    'rswift',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'mac-cain13/R.swift',
  },
  distributable: null,
  build: {
    script: [
      'ASSET=rswift-{{version}}.zip',
      'curl -Lfo "$ASSET" "https://github.com/mac-cain13/R.swift/releases/download/{{version}}/$ASSET"',
      'unzip -q "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 rswift {{prefix}}/bin/rswift',
    ],
  },
  test: {
    script: [
      'test "$(rswift --version)" = "{{version}}"',
    ],
  },
}
