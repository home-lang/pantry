import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/saagarjha/unxip',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'unxip',
  programs: [
    'unxip',
  ],
  distributable: {
    url: 'https://github.com/saagarjha/unxip/archive/refs/tags/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'curl -Lfo unxip "https://github.com/saagarjha/unxip/releases/download/v{{version.marketing}}/unxip"',
      'chmod +x unxip',
      'mkdir -p {{prefix}}/bin',
      'mv unxip {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'if test {{ hw.platform }}+{{ hw.arch }} = "darwin+x86-64"; then exit 0; fi',
      'unxip --help',
    ],
  },
}
