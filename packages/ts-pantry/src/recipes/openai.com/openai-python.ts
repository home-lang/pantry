import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openai.com/openai-python',
  name: 'openai-python',
  programs: [],
  dependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/openai/openai-python/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/openai',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/venv/lib',
      },
    ],
  },
  test: {
    script: [
      'python -c "import openai; print(openai.__version__)" | tee out',
      'test "$(cat out)" = {{version}}',
    ],
  },
}
