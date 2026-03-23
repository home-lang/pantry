import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'code.visualstudio.com',
  name: 'Visual Studio Code',
  description: 'A lightweight but powerful source code editor.',
  homepage: 'https://code.visualstudio.com',
  github: 'https://github.com/microsoft/vscode',
  programs: ['code'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],
  versionSource: {
    type: 'github-releases',
    repo: 'microsoft/vscode',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'if test "{{hw.arch}}" = "aarch64"; then ARCH="darwin-arm64"',
    'else ARCH="darwin"; fi',
    'curl -fSL "https://update.code.visualstudio.com/{{version}}/${ARCH}/stable" -o /tmp/vscode.zip',
    'mkdir -p "{{prefix}}"',
    'cd /tmp && unzip -qo vscode.zip',
    'mv "/tmp/Visual Studio Code.app" "{{prefix}}/Visual Studio Code.app"',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Visual Studio Code.app/Contents/Resources/app/bin/code" "{{prefix}}/bin/code"',
    ],
  },
}
