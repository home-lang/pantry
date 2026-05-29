import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vamp-plugins.org',
  name: 'vamp',
  description: 'Audio processing plugin system sdk',
  homepage: 'https://www.vamp-plugins.org/',
  programs: ['vamp-simple-host', 'vamp-rdf-template-generator'],
  dependencies: {
    'xiph.org/flac': '^1.4',
    'xiph.org/ogg': '^1.3',
    'github.com/libsndfile/libsndfile': '^1.2',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'curl.se': '*',
  },
  distributable: null,

  build: {
    script: [
      // get archive url
      // ex: https://code.soundsoftware.ac.uk/attachments/download/2588/vamp-plugin-sdk-2.9.0.tar.gz
      // we need to find url from the page because it's not a fixed url
      'DIST_URL=$(curl -s https://vamp-plugins.org/develop.html | grep -o \'https://code.soundsoftware.ac.uk/attachments/download/[0-9]*/vamp-plugin-sdk-{{version}}.tar.gz\')',
      'curl -L $DIST_URL | tar -xz --strip-components 1',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },

  test: {
    script: [
      'vamp-simple-host -v | grep {{version.marketing}}',
      'cp {{prefix}}/lib/vamp/vamp-example-plugins.so $OUT',
      'vamp-simple-host -l | grep \'Amplitude Follower\'',
    ],
    env: {
      VAMP_PATH: '$PWD',
    },
  },
}
