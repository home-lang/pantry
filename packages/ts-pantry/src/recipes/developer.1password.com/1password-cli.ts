import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'developer.1password.com/1password-cli',
  name: '1password-cli',
  programs: [
    'op',
  ],
  buildDependencies: {
    'info-zip.org/unzip': '^6',
    'gnupg.org': '^2',
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -sSfo op.zip https://cache.agilebits.com/dist/1P/op2/pkg/v{{version.raw}}/op_{{hw.platform}}_${ARCH_ALIAS}_v{{version.raw}}.zip',
      'unzip -od op op.zip && rm op.zip',
      'mkdir -p {{prefix}}/bin',
      'mv op/op {{prefix}}/bin/',
    ],
    env: {
      aarch64: {
        ARCH_ALIAS: 'arm64',
      },
      'x86-64': {
        ARCH_ALIAS: 'amd64',
      },
    },
  },
}
