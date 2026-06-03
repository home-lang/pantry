import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/realm/SwiftLint',
  name: 'SwiftLint',
  programs: [
    'swiftlint',
  ],
  dependencies: {
    linux: {
      'curl.se': 8,
      'gnome.org/libxml2': 2,
    },
  },
  buildDependencies: {
    'curl.se': '*',
    'info-zip.org/unzip': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -Lfo swiftlint.zip "https://github.com/realm/SwiftLint/releases/download/{{version}}/$ZIP_NAME"',
      'unzip -o swiftlint.zip',
    ],
    env: {
      darwin: {
        ZIP_NAME: 'portable_swiftlint.zip',
      },
      'linux/x86-64': {
        ZIP_NAME: 'swiftlint_linux_amd64.zip',
      },
      'linux/aarch64': {
        ZIP_NAME: 'swiftlint_linux_arm64.zip',
      },
    },
  },
  test: {
    script: [
      'test "$(swiftlint --version)" = {{version}}',
    ],
  },
}
