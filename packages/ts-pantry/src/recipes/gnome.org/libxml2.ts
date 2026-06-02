import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/libxml2',
  name: 'libxml2',
  description: 'libxml2 is the XML C parser and toolkit developed for the GNOME project',
  homepage: 'http://www.xmlsoft.org/',
  github: 'https://github.com/GNOME/libxml2',
  programs: ['xml2-config', 'xmlcatalog', 'xmllint'],
  versionSource: {
    type: 'github-tags',
    repo: 'GNOME/libxml2',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/libxml2/{{version.marketing}}/libxml2-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'python.org': '>=3<3.12',
    'doxygen.nl': '*',
  },

  build: {
    script: [
      // in 2.12.10, some files have future timestamps which break make
      { run: 'find . -type f -print0 | xargs -0 touch', if: '=2.12.10' },

      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',

      // Make xml2-config relocatable: replace the hard-coded install prefix
      // with a path derived from the script's own location.
      {
        'working-directory': '{{prefix}}/bin',
        run: 'sed -i \'s|{{prefix}}|"$(cd "$(dirname "$0")/.." \\&\\& pwd)"|\' xml2-config',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--without-lzma',
        // changed to disabled by default in 2.15; we keep python bindings on
        '--with-python',
        '--without-docs',
      ],
      linux: {
        // undefined symbol errors in newer llvms prevent building shared libs
        CFLAGS: '$CFLAGS -Wl,--undefined-version',
      },
    },
  },
}
