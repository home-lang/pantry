import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/yonaskolb/XcodeGen',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'XcodeGen',
  programs: [
    'xcodegen',
    'xcodegen-init',
  ],
  distributable: {
    url: 'https://github.com/yonaskolb/XcodeGen/releases/download/{{version}}/xcodegen.zip',
  },
  build: {
    script: [
      'cp "$SRCROOT"/xcodegen/bin/xcodegen .',
      'install -m755 "$SRCROOT"/props/xcodegen-init ./xcodegen-init',
    ],
  },
  test: {
    script: [
      '[[ "$(xcodegen --version)" = "Version: {{version}}" ]]',
      'xcodegen-init --help | grep -q xcodegen-init',
      'mkdir -p ./Sources',
      'xcodegen-init $FIXTURE --write-only --output ./project.yml',
      'test -f ./project.yml',
      'grep -q "^name: SampleApp\\$" ./project.yml',
      'grep -q "^  SampleApp:\\$" ./project.yml',
      'xcodegen dump --spec ./project.yml --type yaml >/dev/null',
    ],
  },
}
