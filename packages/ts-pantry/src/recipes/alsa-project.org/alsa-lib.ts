import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'alsa-project.org/alsa-lib',
  name: 'alsa-lib',
  programs: [
    'aserver',
  ],
  distributable: {
    url: 'https://www.alsa-project.org/files/pub/lib/alsa-lib-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'1i int close_range(unsigned int first, unsigned int last, int flags);\' ucm_exec.c',
        if: '>=1.2.15',
        'working-directory': 'src/ucm',
      },
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
      linux: {
        CFLAGS: [
          '-Wl,--undefined-version',
        ],
      },
    },
  },
  test: {
    script: [
      'cc $FIXTURE -lasound -o test',
      './test',
    ],
  },
}
