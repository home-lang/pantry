import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'breakfastquay.com/rubberband',
  name: 'rubberband',
  programs: [
    'rubberband',
  ],
  dependencies: {
    'github.com/libsndfile/libsamplerate': '^0.2',
    'github.com/libsndfile/libsndfile': '^1.2',
    linux: {
      'fftw.org': '^3.3',
      'ladspa.org': '^1.17',
      'vamp-plugins.org': '^2.9',
    },
  },
  buildDependencies: {
    'mesonbuild.com': '^1.3.2',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://breakfastquay.com/files/releases/rubberband-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dresampler=libsamplerate',
      ],
      linux: {
        LDFLAGS: '-fPIC',
        ARGS: [
          '-Dfft=fftw',
        ],
      },
    },
  },
  test: {
    script: [
      'rubberband -V 2>&1 | grep {{version}}',
      'rubberband -t2 test.wav out.wav 2>&1 | grep \'Processing...\'',
      'ls | grep out.wav',
    ],
  },
}
