import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/SwiftGen/SwiftGen',
  name: 'SwiftGen',
  programs: [
    'swiftgen',
  ],
  distributable: {
    url: 'https://github.com/SwiftGen/SwiftGen/releases/download/{{version}}/swiftgen-{{version}}.zip',
  },
  build: {
    script: [
      'cp -a "$SRCROOT"/bin/swiftgen "$SRCROOT"/bin/SwiftGen_SwiftGenCLI.bundle .',
    ],
  },
  test: {
    script: [
      '[[ "$(swiftgen --version)" = "SwiftGen v{{version}}"* ]]',
    ],
  },
}
