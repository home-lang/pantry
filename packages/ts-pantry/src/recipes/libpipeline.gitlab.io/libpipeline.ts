import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libpipeline.gitlab.io/libpipeline',
  name: 'libpipeline',
  programs: [],
  buildDependencies: {
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://download.savannah.nongnu.org/releases/libpipeline/libpipeline-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lpipeline -o test',
      './test | grep "Hello world"',
    ],
  },
}
