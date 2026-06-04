import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ChargePoint/xcparse',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'xcparse',
  programs: [
    'xcparse',
  ],
  distributable: {
    url: 'https://github.com/ChargePoint/xcparse/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'make prefix={{prefix}} install',
    ],
  },
  test: {
    script: [
      'xcparse --help',
      'xcparse version | grep {{version}}',
      'curl -L "${TESTDATA}" | tar -xz',
      'xcparse screenshots --os --model --test-plan-config SanityResults.xcresult .',
      'ls | grep \'iPhone 12 (17.0)\'',
    ],
  },
}
