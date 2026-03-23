import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: '1password.com',
  name: '1Password',
  description: 'A password manager and secure vault.',
  homepage: 'https://1password.com',
  programs: ['1password'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'if test "{{hw.arch}}" = "aarch64"; then ARCH="aarch64"; else ARCH="x86_64"; fi',
      'curl -fSL "https://downloads.1password.com/mac/1Password-{{version}}-${ARCH}.zip" -o /tmp/1password.zip',
      'cd /tmp && unzip -qo 1password.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/1Password.app" "{{prefix}}/1Password.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../1Password.app/Contents/MacOS/1Password" "{{prefix}}/bin/1password"',
    ],
  },
}
