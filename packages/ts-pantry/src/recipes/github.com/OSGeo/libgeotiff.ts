import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/OSGeo/libgeotiff',
  name: 'libgeotiff',
  programs: [
    'applygeo',
    'geotifcp',
    'listgeo',
  ],
  dependencies: {
    'libjpeg-turbo.org': '*',
    'simplesystems.org/libtiff': '*',
    'proj.org': '*',
  },
  distributable: {
    url: 'https://github.com/OSGeo/libgeotiff/releases/download/{{version}}/libgeotiff-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--with-jpeg',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -ltiff -lgeotiff -o test',
      './test test.tiff',
      'listgeo test.tiff | grep GeogInvFlatteningGeoKey',
    ],
  },
}
