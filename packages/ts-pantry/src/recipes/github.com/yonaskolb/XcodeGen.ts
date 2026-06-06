import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/yonaskolb/XcodeGen',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'XcodeGen',
  programs: [
    'xcodegen',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'yonaskolb/XcodeGen',
  },
  distributable: null,
  build: {
    script: [
      'ASSET=xcodegen.zip',
      'curl -Lfo "$ASSET" "https://github.com/yonaskolb/XcodeGen/releases/download/{{version}}/$ASSET"',
      'unzip -q "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 xcodegen/bin/xcodegen {{prefix}}/bin/xcodegen',
    ],
  },
  test: {
    script: [
      '[[ "$(xcodegen --version)" = "Version: {{version}}" ]]',
    ],
  },
}
