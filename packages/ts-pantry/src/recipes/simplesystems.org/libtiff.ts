import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'simplesystems.org/libtiff',
  name: 'libtiff',
  programs: [
    'tiffcp',
    'tiffdump',
    'tiffinfo',
    'tiffset',
    'tiffsplit',
  ],
  dependencies: {
    'facebook.com/zstd': '^1',
    'libjpeg-turbo.org': '^2',
    'zlib.net': '^1',
  },
  distributable: {
    url: 'https://download.osgeo.org/libtiff/tiff-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-zstd',
        '--disable-dependency-tracking',
        '--disable-lzma',
        '--disable-webp',
        // Lerc and libdeflate aren't pantry packages; without these flags
        // configure auto-detects the build box's system -dev packages and bakes
        // `Requires.private: Lerc libdeflate` into libtiff-4.pc, which then breaks
        // every pkg-config consumer (openslide, gdal, …) that lacks those .pc files.
        '--disable-lerc',
        '--disable-libdeflate',
        '--with-jpeg-include-dir={{deps.libjpeg-turbo.org.prefix}}/include',
        '--with-jpeg-lib-dir={{deps.libjpeg-turbo.org.prefix}}/lib',
        '--without-x',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -ltiff',
      './a.out fixture.tiff',
      'tiffdump fixture.tiff',
    ],
  },
}
