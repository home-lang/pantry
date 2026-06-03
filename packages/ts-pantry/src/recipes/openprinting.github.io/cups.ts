import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openprinting.github.io/cups',
  name: 'cups',
  programs: [
    'cups-config',
    'ippeveprinter',
    'ipptool',
  ],
  dependencies: {
    'kerberos.org': '*',
    'zlib.net': '*',
    linux: {
      'openssl.org': '^1.1',
    },
  },
  distributable: {
    url: 'https://github.com/OpenPrinting/cups/releases/download/v{{version}}/cups-{{version}}-source.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-components=core',
        '--without-bundledir',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
    },
  },
}
