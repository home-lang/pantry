import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'iterm2.com',
  name: 'iTerm2',
  description: 'A terminal emulator for macOS with advanced features.',
  homepage: 'https://iterm2.com',
  programs: ['iterm2'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      '# iTerm2 version format: 3_5_6 for URL (dots → underscores)',
      'URL_VERSION=$(echo "{{version}}" | tr "." "_")',
      'curl -fSL "https://iterm2.com/downloads/stable/iTerm2-${URL_VERSION}.zip" -o /tmp/iterm2.zip',
      'cd /tmp && unzip -qo iterm2.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/iTerm.app" "{{prefix}}/iTerm.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../iTerm.app/Contents/MacOS/iTerm2" "{{prefix}}/bin/iterm2"',
    ],
  },
}
