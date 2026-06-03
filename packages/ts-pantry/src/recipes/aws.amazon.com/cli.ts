import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aws.amazon.com/cli',
  name: 'cli',
  programs: [
    'aws',
  ],
  dependencies: {
    'sourceware.org/libffi': '^3',
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.48.0',
    'rust-lang.org/cargo': '*',
    'python.org': '>=3.7<3.12',
  },
  distributable: {
    url: 'https://github.com/aws/aws-cli/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} aws',
    ],
    env: {
      CPATH: '$CPATH:{{deps.python.org.prefix}}/include/python{{deps.python.org.version.marketing}}',
    },
  },
}
