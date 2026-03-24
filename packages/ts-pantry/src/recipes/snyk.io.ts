import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'snyk.io',
  name: 'snyk',
  description: 'Scans and monitors projects for security vulnerabilities',
  homepage: 'https://snyk.io',
  programs: ['snyk'],

  build: {
    script: [
      'if test "{{hw.platform}}" = "darwin"; then',
      '  if test "{{hw.arch}}" = "aarch64"; then BINARY_NAME="snyk-macos-arm64"',
      '  else BINARY_NAME="snyk-macos"; fi',
      'else',
      '  if test "{{hw.arch}}" = "aarch64"; then BINARY_NAME="snyk-linux-arm64"',
      '  else BINARY_NAME="snyk-linux"; fi',
      'fi',
      'mkdir -p "{{prefix}}/bin"',
      'curl -fSL -o "{{prefix}}/bin/snyk" "https://github.com/snyk/cli/releases/download/v{{version}}/${BINARY_NAME}"',
      'chmod +x "{{prefix}}/bin/snyk"',
    ],
  },
}
