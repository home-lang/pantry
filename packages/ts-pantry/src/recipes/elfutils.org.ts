import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'elfutils.org',
  name: 'elfutils',
  programs: ['eu-addr2line', 'eu-ar', 'eu-elfclassify', 'eu-elfcmp', 'eu-elfcompress', 'eu-elflint', 'eu-findtextrel', 'eu-nm', 'eu-objdump', 'eu-ranlib', 'eu-readelf', 'eu-size', 'eu-stack', 'eu-strings', 'eu-strip', 'eu-unstrip'],
  platforms: ['linux'],
  distributable: {
    url: 'https://sourceware.org/elfutils/ftp/{{version.marketing}}/elfutils-{{version.marketing}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'sourceware.org/bzip2': '*',
    'tukaani.org/xz': '*',
    'zlib.net': '*',
    'facebook.com/zstd': '*',
  },
  buildDependencies: {
    'gnu.org/m4': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'CFLAGS': ['-Wno-error'],
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--disable-silent-rules', '--disable-libdebuginfod', '--disable-debuginfod', '--disable-demangler', '--with-bzlib', '--with-lzma', '--with-zlib', '--with-zstd'],
    },
  },
}
