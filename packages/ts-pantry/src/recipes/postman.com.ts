import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'postman.com',
  name: 'Postman',
  description: 'An API platform for building and testing APIs.',
  homepage: 'https://postman.com',
  programs: ['postman'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'if test "{{hw.arch}}" = "aarch64"; then ARCH="osx_arm64"; else ARCH="osx64"; fi',
    'curl -fSL -L "https://dl.pstmn.io/download/latest/${ARCH}" -o /tmp/postman.zip',
    'cd /tmp && unzip -qo postman.zip',
    'mkdir -p "{{prefix}}"',
    'mv "/tmp/Postman.app" "{{prefix}}/Postman.app"',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Postman.app/Contents/MacOS/Postman" "{{prefix}}/bin/postman"',
    ],
  },
}
