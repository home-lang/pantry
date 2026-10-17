import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tcl-lang.org',
  name: 'tcl-lang',
  description: 'Tool Command Language',
  homepage: 'https://www.tcl-lang.org',
  programs: ['tclsh', 'wish'],
  dependencies: {
    'zlib.net': '^1',
    linux: { 'x.org/x11': '^1', 'x.org/exts': '^1', 'x.org/xft': '^2' },
  },
  buildDependencies: { 'curl.se': '*', 'freedesktop.org/pkg-config': '~0.29' },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/tcl/Tcl/{{version}}/tcl{{version}}-src.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cd unix',
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'ln -s tclsh{{version.marketing}} {{prefix}}/bin/tclsh',
      'rm -f {{prefix}}/bin/sqlite3_analyzer',
      // This package provides Tcl and Tk. CPython's tkinter extension requires
      // the matching Tk library; publishing Tcl alone silently breaks its ABI.
      'cd ..',
      'mkdir -p tk-source {{prefix}}/share/licenses/tcl-tk',
      'install -m 0644 license.terms {{prefix}}/share/licenses/tcl-tk/LICENSE-Tcl',
      'curl -fsSL https://downloads.sourceforge.net/project/tcl/Tcl/{{version}}/tk{{version}}-src.tar.gz -o tk-source.tar.gz',
      'tar -xf tk-source.tar.gz -C tk-source --strip-components=1',
      'cd tk-source/unix',
      { run: 'TK_ARGS="--enable-aqua"', if: 'darwin' },
      { run: 'TK_ARGS="--enable-xft"', if: 'linux' },
      './configure --prefix={{prefix}} --with-tcl={{prefix}}/lib $TK_ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'ln -sf wish{{version.marketing}} {{prefix}}/bin/wish',
      'install -m 0644 ../license.terms {{prefix}}/share/licenses/tcl-tk/LICENSE-Tk',
    ],
  },
  test: {
    required: true,
    script: [
      'test "$(printf \'puts [info patchlevel]\\n\' | {{prefix}}/bin/tclsh)" = "{{version}}"',
      'test -x {{prefix}}/bin/wish',
      'test -n "$(find {{prefix}}/lib -name \'libtk*.so\' -o -name \'libtk*.dylib\')"',
    ],
  },
}
