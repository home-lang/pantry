import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/gobject-introspection',
  name: 'gobject-introspection',
  programs: [
    'g-ir-annotation-tool',
    'g-ir-compiler',
    'g-ir-generate',
    'g-ir-inspect',
    'g-ir-scanner',
  ],
  dependencies: {
    'gnome.org/glib': '2',
    'sourceware.org/libffi': '3',
    'gnu.org/bison': '3',
    'python.org': '~3.11',
    'github.com/westes/flex': '2',
  },
  buildDependencies: {
    'mesonbuild.com': '^1.2',
    'ninja-build.org': '1',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gobject-introspection/{{version.major}}.{{version.minor}}/gobject-introspection-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      // The `tests` meson option was only introduced in 1.84.0; passing
      // -Dtests=false to 1.82.0 errors with `Unknown option: "tests"`.
      {
        run: 'meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release -Dgtk_doc=false -Dtests=false -Dpython=python3',
        if: '>=1.84.0',
      },
      {
        run: 'meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release -Dgtk_doc=false -Dpython=python3',
        if: '<1.84.0',
      },
      'ninja -v',
      'ninja install',
      {
        run: 'sed -i \'1s|^#!.*python.*|#!/usr/bin/env python3|\' g-ir-annotation-tool g-ir-scanner',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      CC: 'clang',
    },
  },
  test: {
    script: [
      'git clone $FIXTURE test',
      'cd test',
      'git apply ../test_make.diff',
      'sed -i \'s|(CC)|(CC) -Wl,-rpath,{{pkgx.prefix}}|\' Makefile',
      'make',
      'test -f Tut-0.1.typelib',
    ],
  },
}
