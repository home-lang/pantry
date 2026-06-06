import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'arduino.github.io/arduino-cli',
  name: 'arduino-cli',
  programs: [
    'arduino-cli',
  ],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: null,
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="arduino-cli_${VERSION}_macOS_ARM64.tar.gz" ;;',
      '  darwin+x86-64)  ASSET="arduino-cli_${VERSION}_macOS_64bit.tar.gz" ;;',
      '  linux+aarch64)  ASSET="arduino-cli_${VERSION}_Linux_ARM64.tar.gz" ;;',
      '  linux+x86-64)   ASSET="arduino-cli_${VERSION}_Linux_64bit.tar.gz" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo arduino-cli.tar.gz "https://github.com/arduino/arduino-cli/releases/download/v${VERSION}/${ASSET}"',
      'mkdir -p {{prefix}}/bin',
      'tar xzf arduino-cli.tar.gz -C {{prefix}}/bin arduino-cli',
      'chmod 755 {{prefix}}/bin/arduino-cli',
    ],
  },
  test: {
    script: [
      '{{prefix}}/bin/arduino-cli version > out',
      'grep {{version}} out',
    ],
  },
}
