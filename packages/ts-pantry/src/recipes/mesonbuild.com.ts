import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mesonbuild.com',
  name: 'meson',
  description: 'Fast and user friendly build system',
  homepage: 'https://mesonbuild.com/',
  github: 'https://github.com/mesonbuild/meson',
  programs: ['meson'],
  versionSource: {
    type: 'github-releases',
    repo: 'mesonbuild/meson',
  },
  distributable: {
    url: 'https://github.com/mesonbuild/meson/releases/download/{{version}}/meson-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} meson',
      {
        run: 'cp -a {{deps.python.org.prefix}}/lib/libpython* .',
        if: 'linux',
        'working-directory': '${{prefix}}/lib',
      },
    ],
  },
}
