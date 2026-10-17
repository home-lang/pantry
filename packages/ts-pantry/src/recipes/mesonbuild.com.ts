import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mesonbuild.com',
  propsDir: 'props/mesonbuild.com',
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
    'python.org': '~3.12',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin {{prefix}}/libexec/meson',
      'cp -a meson.py mesonbuild {{prefix}}/libexec/meson/',
      'install -m 0755 props/meson {{prefix}}/bin/meson',
      'mkdir -p {{prefix}}/share/licenses/meson',
      'install -m 0644 COPYING {{prefix}}/share/licenses/meson/COPYING',
    ],
  },
  test: {
    script: ['{{deps.python.org.prefix}}/bin/python3 {{prefix}}/libexec/meson/meson.py --version'],
    required: true,
  },
}
