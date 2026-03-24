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
    repo: 'mesonbuild/meson/tags',
  },
  distributable: {
    url: 'https://github.com/mesonbuild/meson/releases/download/{{version}}/meson-{{version}}.tar.gz',
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
      'bkpyvenv seal {{prefix}} meson',
      'cd "${{prefix}}/lib"',
      'cp -a {{deps.python.org.prefix}}/lib/libpython* .',
    ],
  },
}
