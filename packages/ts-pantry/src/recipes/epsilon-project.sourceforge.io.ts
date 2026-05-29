import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'epsilon-project.sourceforge.io',
  name: 'epsilon',
  description: 'Powerful wavelet image compressor',
  homepage: 'https://sourceforge.net/projects/epsilon-project/',
  programs: ['epsilon'],
  dependencies: {
    'rpm.org/popt': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/epsilon-project/epsilon/{{version}}/epsilon-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
    },
    script: [
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
  },

  test: {
    script: [
      'epsilon --version | grep {{version}}',
    ],
  },
}
