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
    'gnome.org/glib': 2,
    'sourceware.org/libffi': 3,
    'gnu.org/bison': 3,
    'python.org': '~3.11',
    'github.com/westes/flex': 2,
  },
  buildDependencies: {
    'mesonbuild.com': '^1.2',
    'ninja-build.org': 1,
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gobject-introspection/{{version.major}}.{{version.minor}}/gobject-introspection-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release -Dpython=python3.11',
      'ninja -v',
      'ninja install',
      {
        run: 'sed -i \'s|env {{deps.python.org.prefix}}/bin/python|env python|\' g-ir-annotation-tool g-ir-scanner',
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
