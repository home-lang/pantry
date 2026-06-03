import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openai.com/whisper',
  name: 'whisper',
  programs: [
    'whisper',
  ],
  dependencies: {
    'python.org': '~3.11',
    'ffmpeg.org': '^6.1',
    'huggingface.co': '^0.19',
    'pyyaml.org': '^0.2',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
  },
  distributable: {
    url: 'https://github.com/openai/whisper/archive/v{{version.major}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^numpy$/numpy<2/\' requirements.txt',
      'sed -i \'s/"numpy"/"numpy<2"/\' pyproject.toml',
      'python-venv.sh {{prefix}}/bin/whisper',
    ],
  },
  test: {
    script: [
      'curl -L $TESTFILE > test.flac',
      'whisper test.flac --model tiny.en --output_format txt',
      'cat test.txt | grep \'American\'',
    ],
  },
}
