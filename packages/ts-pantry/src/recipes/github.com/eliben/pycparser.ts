import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/eliben/pycparser',
  name: 'pycparser',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/eliben/pycparser/archive/release_v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'mkdir -p {{prefix}}/pkgshare',
      'cp -r examples {{prefix}}/pkgshare/',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '{{prefix}}/lib',
      },
    ],
  },
  test: {
    script: [
      'python {{prefix}}/pkgshare/examples/c-to-c.py {{prefix}}/pkgshare/examples/c_files/basic.c',
    ],
  },
}
