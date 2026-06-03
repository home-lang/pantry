import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/xmlstar',
  name: 'xmlstar',
  programs: [
    'xml',
    'xmlstarlet',
  ],
  dependencies: {
    'gnome.org/libxslt': '^1',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/xmlstar/xmlstarlet/{{version}}/xmlstarlet-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
      {
        run: 'ln -s xml xmlstarlet',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--mandir={{prefix}}/share/man',
      ],
    },
  },
  test: {
    script: [
      'xmlstarlet --version | grep {{version}}',
      'xml --help',
      'xml validate test.xml | grep \'valid\'',
    ],
  },
}
