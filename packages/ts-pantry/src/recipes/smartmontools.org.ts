import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'smartmontools.org',
  name: 'smartmontools',
  description: 'SMART hard drive monitoring',
  homepage: 'https://www.smartmontools.org/',
  programs: ['smartctl', 'smartd'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/smartmontools/smartmontools/{{version.marketing}}/smartmontools-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-dependency-tracking', '--with-savestates', '--with-attributelog', '--with-nvme-devicescan'],
    },
  },
}
