import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/SwiftGen/SwiftGen',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'SwiftGen',
  programs: [
    'swiftgen',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'SwiftGen/SwiftGen',
  },
  distributable: null,
  build: {
    script: [
      'ASSET=swiftgen-{{version}}.zip',
      'curl -Lfo "$ASSET" "https://github.com/SwiftGen/SwiftGen/releases/download/{{version}}/$ASSET"',
      'unzip -q "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'cp -a bin/swiftgen bin/SwiftGen_SwiftGenCLI.bundle {{prefix}}/bin/',
      'chmod +x {{prefix}}/bin/swiftgen',
    ],
  },
  test: {
    script: [
      '[[ "$(swiftgen --version)" = "SwiftGen v{{version}}"* ]]',
    ],
  },
}
