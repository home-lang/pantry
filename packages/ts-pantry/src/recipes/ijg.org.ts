import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/ijg.org',
  domain: 'ijg.org',
  name: 'ijg',
  programs: ['cjpeg', 'djpeg', 'jpegtran', 'rdjpgcom', 'wrjpgcom'],
  distributable: {
    url: 'https://ijg.org/files/jpegsrc.v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // ijg's bundled config.guess (2011) doesn't recognize aarch64, so overwrite it
      // with our modern props copies. The `if: '^8'` gate was dropped: ijg versions are
      // letter-suffixed (e.g. "8d", "9e"), which the numeric range parser reads as 0, so
      // `^8` never matched and the override silently skipped — breaking arm64 (and any
      // non-x86 host whose triple the 2011 config.guess can't recognize).
      { run: 'cp props/config.guess props/config.sub .' },
      './configure --disable-dependency-tracking --disable-silent-rules --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
