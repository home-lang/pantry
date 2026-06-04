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
    // unzip the prebuilt (vendored) binary straight into the install bin dir,
    // otherwise it lands in srcroot and packaging fails with "produced no files".
    'working-directory': '{{prefix}}/bin',
    script: [
      'curl -Lfo swiftlint.zip "https://github.com/realm/SwiftLint/releases/download/{{version}}/$ZIP_NAME"',
      'unzip -o swiftlint.zip',
      'rm -f swiftlint.zip',
      'chmod +x swiftlint',
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
    // the linux build is a vendored binary that requires a newer glibc than the
    // build box, so it can't be exercised there — only assert the version on darwin.
    script: [
      'if [ "$(uname)" = "Darwin" ]; then test "$(swiftlint --version)" = {{version}}; fi',
    ],
  },
}
