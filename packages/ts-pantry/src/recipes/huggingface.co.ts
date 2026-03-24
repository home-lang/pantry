import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'huggingface.co',
  name: 'huggingface/cli',
  description: 'The official Python client for the Huggingface Hub.',
  homepage: 'https://huggingface.co/docs/huggingface_hub/index',
  github: 'https://github.com/huggingface/huggingface_hub',
  programs: ['huggingface-cli'],
  versionSource: {
    type: 'github-releases',
    repo: 'huggingface/huggingface_hub',
  },
  distributable: {
    url: 'https://github.com/huggingface/huggingface_hub/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'ls -l {{prefix}}/{venv/,}bin || true',
      'bkpyvenv seal {{prefix}} huggingface-cli',
      'ln -s huggingface-cli {{prefix}}/venv/bin/hf',
      'ln -s huggingface-cli {{prefix}}/bin/hf',
      'bkpyvenv seal {{prefix}} hf huggingface-cli',
      'bkpyvenv seal {{prefix}} hf',
      'ln -s hf {{prefix}}/venv/bin/huggingface-cli',
      'ln -s hf {{prefix}}/bin/huggingface-cli',
    ],
  },
}
