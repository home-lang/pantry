import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/sentencepiece',
  name: 'sentencepiece',
  programs: [
    'spm_decode',
    'spm_encode',
    'spm_export_vocab',
    'spm_normalize',
    'spm_train',
  ],
  buildDependencies: {
    'cmake.org': '^3',
    'python.org': '~3.11',
    'pip.pypa.io': '*',
    'freedesktop.org/pkg-config': '~0.29',
    'protobuf.dev': 25,
  },
  distributable: {
    url: 'https://github.com/google/sentencepiece/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $CMAKE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
      {
        run: 'pip install ../python --verbose  --prefix={{prefix}}',
        if: 'darwin',
      },
    ],
    env: {
      PKG_CONFIG_PATH: '$PKG_CONFIG_PATH:{{prefix}}/lib/pkgconfig',
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
    },
  },
  test: {
    script: [
      'wget https://raw.githubusercontent.com/google/sentencepiece/master/data/botchan.txt',
      'spm_train --input=botchan.txt --model_prefix=m --vocab_size=1000',
      'python -c \'import sentencepiece as spm; spm.SentencePieceProcessor()\'',
    ],
  },
}
