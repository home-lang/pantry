import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnome.org/vala",
  name: "vala",
  programs: [
    "vala",
    "valac",
    "valadoc",
    "vala-gen-introspect",
    "vapigen",
  ],
  dependencies: {
    'gnome.org/glib': "*",
    'graphviz.org': "*",
    'freedesktop.org/pkg-config': "*",
    'gnu.org/gettext': "*",
  },
  buildDependencies: {
    'gnu.org/bison': "*",
    'github.com/westes/flex': "*",
    'gnome.org/libxslt': "=1.1.43",
    'gnome.org/libxml2': "~2.13",
    'gnome.org/gobject-introspection': "*",
  },
  distributable: {
    url: "https://download.gnome.org/sources/vala/{{version.marketing}}/vala-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure $CONFIGURE_ARGS",
      "make --jobs {{hw.concurrency}}",
      "make --jobs {{hw.concurrency}} install",
      {
        run: "for d in vala-{{version.marketing}} valadoc-{{version.marketing}}; do\n  if [ -d $d ]; then\n    mv $d/* .\n    rmdir $d\n    ln -s . $d\n  fi\ndone\n",
        'working-directory': "${{prefix}}/include",
      },
      {
        run: "for d in vala-{{version.marketing}} valadoc-{{version.marketing}}; do\n  if [ -d $d ]; then\n    mv $d/* .\n    rmdir $d\n    ln -s . $d\n  fi\ndone\n",
        'working-directory': "${{prefix}}/lib",
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\{{prefix}}\",
        "--libdir=\{{prefix}}/lib\",
        "--disable-silent-rules",
      ],
    },
  },
  test: {
    script: [
      "valac -g --cc=clang --save-temps test.vala",
      "ls | grep \"test.c\"",
      "./test | grep \"Hello World!\"",
      "vala --version | grep {{version}}",
    ],
  },
}
