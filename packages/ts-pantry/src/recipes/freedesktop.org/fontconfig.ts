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
    // The prebuilt freetype binary ships a freetype2.pc whose
    // `Requires.private: zlib, libpng, libbrotlidec` lists libpng/libbrotlidec.
    // Neither has an S3 binary nor a system .pc on the build box, so
    // `pkg-config freetype2` fails ("Package 'libpng'/'libbrotlidec' not found").
    // fontconfig links freetype dynamically, so the private static-link deps are
    // irrelevant: hand configure FREETYPE_CFLAGS/FREETYPE_LIBS directly to skip
    // the pkg-config probe entirely.
    env: {
      FREETYPE_CFLAGS: '-I{{deps.freetype.org.prefix}}/include/freetype2',
      FREETYPE_LIBS: '-L{{deps.freetype.org.prefix}}/lib -lfreetype',
    },
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install RUN_FC_CACHE_TEST=false',
      'rm -rf {{prefix}}/share/doc',
      'sed -i \'s|<cachedir>{{prefix}}/var/cache/fontconfig</cachedir>|<cachedir prefix="relative">../../var/cache/fontconfig</cachedir>|\' {{prefix}}/etc/fonts/fonts.conf',
    ],
  },
}
