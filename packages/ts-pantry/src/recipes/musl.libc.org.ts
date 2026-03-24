import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'musl.libc.org',
  name: 'musl.libc',
  programs: ['ld.musl-clang', 'musl-clang'],
  platforms: ['linux'],
  distributable: {
    url: 'https://git.musl-libc.org/cgit/musl/snapshot/musl-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'llvm.org': '*',
  },

  build: {
    script: [
      './configure --prefix={{ prefix }} --syslibdir={{ prefix }}/lib',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'cd "{{prefix}}/lib"',
      'ln -sf libc.so ld-musl-{{hw.arch}}.so.1',
      'cd "{{prefix}}/bin"',
      'sed -i -e \'s/-dynamic-linker "\\$ldso"//\' -e \'s/^sflags=$/sflags="-static"/\' -e \'s/^libc=".*/libc="$(dirname $(dirname $(command -v ld.musl-clang)))"/\' -e \'s#^libc_inc=".*#libc_inc="$libc/include"#\' -e \'s#^libc_lib=".*#libc_lib="$libc/lib"#\' -e \'s/print-prog-name=ld/print-prog-name=ld.lld/\' musl-clang ld.musl-clang',
    ],
    env: {
      'CC': 'clang',
    },
  },
}
