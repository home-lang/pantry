import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'vamp-plugins.org',
  name: 'vamp',
  description: 'Audio processing plugin system sdk',
  homepage: 'https://www.vamp-plugins.org/',
  programs: [],
  distributable: {
    url: 'https://vamp-plugins.org/develop.html',
  },

  build: {
    script: [
      'DIST_URL=$(curl -s https://vamp-plugins.org/develop.html | grep -o \\https://code.soundsoftware.ac.uk/attachments/download/[0-9]*/vamp-plugin-sdk-{{version}}.tar.gz\\)',
      'curl -L $DIST_URL | tar -xz --strip-components 1',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      'vamp-simple-host -v | grep {{version.marketing}}',
      'cp {{prefix}}/lib/vamp/vamp-example-plugins.so $OUT',
      'vamp-simple-host -l | grep \\Amplitude Follower\\',
    ],
  },
}
