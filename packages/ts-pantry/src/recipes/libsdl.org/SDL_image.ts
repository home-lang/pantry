import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libsdl.org/SDL_image',
  name: 'SDL_image',
  programs: [],
  dependencies: {
    'libjpeg-turbo.org': '^2',
    'github.com/AOMediaCodec/libavif': '^0.11',
    'libpng.org': '^1.6',
    'simplesystems.org/libtiff': '^4.5',
    'libsdl.org': '^2',
    'google.com/webp': '^1.3',
  },
  distributable: {
    url: 'https://github.com/libsdl-org/SDL_image/releases/download/release-2.6.3/SDL2_image-2.6.3.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-debug',
        '--disable-imageio',
        '--disable-avif-shared',
        '--disable-jpg-shared',
        '--disable-jxl-shared',
        '--disable-png-shared',
        '--disable-stb-image',
        '--disable-tif-shared',
        '--disable-webp-shared',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE -lSDL2_image',
      './a.out',
    ],
  },
}
