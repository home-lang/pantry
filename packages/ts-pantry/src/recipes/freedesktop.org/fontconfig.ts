import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/fontconfig',
  name: 'fontconfig',
  programs: [
    'fc-cache',
    'fc-cat',
    'fc-conflist',
    'fc-list',
    'fc-match',
    'fc-pattern',
    'fc-query',
    'fc-scan',
    'fc-validate',
  ],
  dependencies: {
    'sourceware.org/bzip2': 1,
    'freetype.org': 2,
    'zlib.net': 1,
    'gnome.org/libxml2': 2,
    'libexpat.github.io': 2,
  },
  buildDependencies: {
    'gnu.org/gperf': 3,
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/api/v4/projects/890/packages/generic/fontconfig/{{version.tag}}/fontconfig-{{version.tag}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install RUN_FC_CACHE_TEST=false',
      'rm -rf {{prefix}}/share/doc',
      'sed -i \'s|<cachedir>{{prefix}}/var/cache/fontconfig</cachedir>|<cachedir prefix="relative">../../var/cache/fontconfig</cachedir>|\' {{prefix}}/etc/fonts/fonts.conf',
    ],
  },
}
