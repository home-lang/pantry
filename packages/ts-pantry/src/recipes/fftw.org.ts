import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fftw.org',
  name: 'fftw',
  description: 'C routines to compute the Discrete Fourier Transform',
  homepage: 'https://fftw.org',
  programs: ['fftw-wisdom', 'fftw-wisdom-to-conf', 'fftwf-wisdom', 'fftwl-wisdom'],
  distributable: {
    url: 'https://fftw.org/fftw-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'open-mpi.org': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure --enable-single $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'make clean',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'make clean',
      './configure --enable-long-double $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'CC': 'clang',
      'ARGS': ['--enable-shared', '--disable-debug', '--prefix={{prefix}}', '--enable-threads', '--disable-dependency-tracking'],
    },
  },
}
