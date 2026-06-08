import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'people.redhat.com/sgrubb/libcap-ng',
  platforms: ['linux'],
  name: 'libcap-ng',
  programs: [
    'captest',
    'filecap',
    'netcap',
    'pscap',
  ],
  distributable: {
    url: 'https://people.redhat.com/sgrubb/libcap-ng/libcap-ng-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lcap-ng -o test',
      './test | grep  ok',
    ],
  },
}
