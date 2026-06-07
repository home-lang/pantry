import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tesseract-ocr.github.io',
  name: 'tesseract',
  description: 'Tesseract Open Source OCR Engine (main repository)',
  homepage: 'https://github.com/tesseract-ocr/',
  github: 'https://github.com/tesseract-ocr/tesseract',
  programs: ['tesseract'],
  versionSource: {
    // Tesseract tags have no `v` prefix (e.g. `5.5.2`) and are published as
    // plain git tags, not GitHub releases with assets — mirror pkgx's
    // `versions: { github: tesseract-ocr/tesseract }` by reading tags and
    // matching only stable x.y.z tags (skip `-rcN` candidates).
    type: 'github-tags',
    repo: 'tesseract-ocr/tesseract',
    tagPattern: /^(\d+\.\d+\.\d+)$/,
  },
  distributable: {
    url: 'https://github.com/tesseract-ocr/tesseract/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'cairographics.org': '1',
    'unicode.org': '71',
    'leptonica.org': '*',
    'libarchive.org': '*',
    'gnome.org/pango': '1',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',

      // install trained datafiles and move to share/tessdata
      {
        run: [
          'wget https://github.com/tesseract-ocr/tessdata/blob/main/eng.traineddata?raw=true -O eng.traineddata',
          'wget https://github.com/tesseract-ocr/tessdata/blob/main/osd.traineddata?raw=true -O osd.traineddata',
        ],
        'working-directory': '{{prefix}}/share/tessdata/',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
        '--datarootdir={{prefix}}/share',
      ],
      linux: {
        // ld.lld: error: undefined symbol: std::filesystem::recursive_directory_iterator
        LDFLAGS: '$LDFLAGS -lstdc++fs',
      },
    },
  },
}
