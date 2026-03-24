import type { RecipeDefinition } from '../../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'logitech.com/options',
  name: 'Logi Options+',
  description: 'Logitech device customization and settings application.',
  homepage: 'https://www.logitech.com/software/logi-options-plus.html',
  programs: ['logi-options'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],

  build: {
    script: [
      'curl -fSL -L -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "https://download01.logi.com/web/ftp/pub/techsupport/optionsplus/logioptionsplus_installer.zip" -o /tmp/logi.zip',
      'cd /tmp && unzip -qo logi.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/logioptionsplus_installer.app" "{{prefix}}/Logi Options+.app" 2>/dev/null || find /tmp -name "*.app" -maxdepth 2 -exec mv {} "{{prefix}}/" \\;',
      'mkdir -p "{{prefix}}/bin"',
      'echo \'#!/bin/bash\' > "{{prefix}}/bin/logi-options"',
      'echo \'open "$(dirname "$0")/../Logi Options+.app" 2>/dev/null || open "$(dirname "$0")"/../*.app\' >> "{{prefix}}/bin/logi-options"',
      'chmod +x "{{prefix}}/bin/logi-options"',
    ],
  },
}
