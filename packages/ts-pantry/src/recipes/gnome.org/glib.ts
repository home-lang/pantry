import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnome.org/glib",
  name: "glib",
  programs: [
    "gdbus",
    "gdbus-codegen",
    "gio",
    "gio-querymodules",
    "glib-compile-resources",
    "glib-compile-schemas",
    "glib-genmarshal",
    "glib-gettextize",
    "glib-mkenums",
    "gobject-query",
    "gresource",
    "gsettings",
    "gtester",
    "gtester-report",
  ],
  dependencies: {
    'gnu.org/gettext': "^0.21",
    'sourceware.org/libffi': '3',
    'pcre.org': '8',
    'pcre.org/v2': '10',
    'python.org': '3',
  },
  buildDependencies: {
    'mesonbuild.com': "^1.2",
    'ninja-build.org': '1',
    'python.org': ">=3.5<3.12",
    'gnome.org/gobject-introspection': "*",
    'gnome.org/libxml2': "~2.13",
  },
  distributable: {
    url: "https://download.gnome.org/sources/glib/{{ version.major }}.{{ version.minor }}/glib-{{ version }}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "python -m venv venv\nsource venv/bin/activate\npython -m pip install packaging\ndeactivate\nPYTHONPATH=\"$(pwd)/venv/lib/python{{deps.python.org.version.marketing}}/site-packages:$PYTHONPATH\"",
      },
      "meson out $ARGS",
      "cd out",
      "ninja install",
      "GT='${prefix}/../../../gnu.org/gettext/v{{ deps.gnu.org/gettext.version.major }}'",
      {
        run: "sed -i -e \\\n's|Libs: -L${libdir} -lglib-2.0 -lintl|Libs: -L${libdir} -lglib-2.0'\\ -L$GT/lib\\ -lintl\\| \\\n./glib-2.0.pc\n\nsed -i -e \\\n's|Cflags: -I${includedir}/glib-2.0 -I${libdir}/glib-2.0/include|Cflags: -I${includedir}/glib-2.0 -I${libdir}/glib-2.0/include'\\ -I$GT/include\\| \\\n./glib-2.0.pc\n",
        'working-directory': "{{prefix}}/lib/pkgconfig",
      },
      {
        run: "mv glib-{{version.major}}.0/* .\nrmdir glib-{{version.major}}.0\nln -s . glib-{{version.major}}.0\nmv gio-unix-{{version.major}}.0/gio/* gio/\nrmdir -p gio-unix-{{version.major}}.0/gio\nln -s . gio-unix-{{version.major}}.0\nln -s ../lib/glib-{{version.major}}.0/include/* .",
        'working-directory': "{{prefix}}/include",
      },
      "cp -a ../venv/lib/python{{deps.python.org.version.marketing}} {{prefix}}/lib",
      {
        run: "ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}",
        'working-directory': "{{prefix}}/lib",
      },
      {
        run: "sed -i -e 's_{{deps.mesonbuild.com.prefix}}/venv/bin/python_/usr/bin/env python_' gdbus-codegen glib-genmarshal glib-mkenums gtester-report",
        'working-directory': "{{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
        "--wrap-mode=nofallback",
        "--buildtype=release",
        "-Dtests=false",
        "-Dintrospection=disabled",
      ],
    },
  },
  test: {
    script: [
      "if [ -f /etc/os-release ] && grep -q '^ID=arch' /etc/os-release; then\n  echo \"Arch Linux detected! Not currently testable.\"\n  exit 0\nfi\n",
      "unset LIBRARY_PATH",
      "unset CPATH",
      "LD_LIBRARY_PATH_BAK=$LD_LIBRARY_PATH",
      "unset LD_LIBRARY_PATH",
      "DYLD_FALLBACK_LIBRARY_PATH_BAK=$DYLD_FALLBACK_LIBRARY_PATH",
      "unset DYLD_FALLBACK_LIBRARY_PATH",
      "cc $CFLAGS test.c $LDFLAGS",
      "export LD_LIBRARY_PATH=$LD_LIBRARY_PATH_BAK",
      "export DYLD_FALLBACK_LIBRARY_PATH=$DYLD_FALLBACK_LIBRARY_PATH_BAK",
      "./a.out",
      "glib-mkenums --help",
    ],
  },
}
