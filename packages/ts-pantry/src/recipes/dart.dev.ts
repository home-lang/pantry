import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dart.dev',
  name: 'dart',
  description: 'The Dart SDK, including the VM, JS and Wasm compilers, analysis, core libraries, and more.',
  homepage: 'https://dart.dev',
  github: 'https://github.com/dart-lang/sdk',
  programs: ['dart', 'dartaotruntime'],
  versionSource: {
    type: 'github-releases',
    repo: 'dart-lang/sdk',
  },

  build: {
    script: [
      'OS=$(uname -s | tr "[:upper:]" "[:lower:]")',
      'ARCH=$(uname -m)',
      'case "$OS/$ARCH" in',
      '  darwin/arm64) SDK="dartsdk-macos-arm64-release.zip" ;;',
      '  darwin/x86_64) SDK="dartsdk-macos-x64-release.zip" ;;',
      '  linux/x86_64) SDK="dartsdk-linux-x64-release.zip" ;;',
      '  linux/aarch64) SDK="dartsdk-linux-arm64-release.zip" ;;',
      '  *) echo "Unsupported platform" && exit 1 ;;',
      'esac',
      'curl -fSL -o /tmp/dartsdk.zip "https://storage.googleapis.com/dart-archive/channels/stable/release/{{version}}/sdk/${SDK}"',
      'mkdir -p "{{prefix}}/libexec" "{{prefix}}/bin"',
      'unzip -qo /tmp/dartsdk.zip -d /tmp/dart-extract',
      'cp -r /tmp/dart-extract/dart-sdk/* "{{prefix}}/libexec/"',
      'ln -sf ../libexec/bin/dart "{{prefix}}/bin/dart"',
      'ln -sf ../libexec/bin/dartaotruntime "{{prefix}}/bin/dartaotruntime" 2>/dev/null || true',
    ],
    skip: ['fix-patchelf'],
  },
}
