import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tcl.tk/tcl',
  name: 'tcl',
  programs: [
    'sqlite3_analyzer',
    'tclsh{{version.major}}.{{version.minor}}',
    'tclsh',
  ],
  distributable: {
    url: 'https://prdownloads.sourceforge.net/tcl/tcl{{ version }}-src.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'make install-private-headers',
      {
        run: 'install_name_tool -change {{prefix}}/lib/libtcl{{version.major}}.{{version.minor}}.dylib @loader_path/../lib/libtcl{{version.major}}.{{version.minor}}.dylib  {{prefix}}/bin/tclsh{{version.major}}.{{version.minor}}',
        if: 'darwin',
      },
      {
        run: 'ln -s tclsh{{version.major}}.{{version.minor}} tclsh',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'echo \'puts "Hello, World!";\' | tclsh',
      'test "$(echo \'puts "Hello, World!";\' | tclsh)" = \'Hello, World!\'',
    ],
  },
}
