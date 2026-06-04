import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "freedesktop.org/shared-mime-info",
  name: "shared-mime-info",
  programs: [
    "update-mime-database",
  ],
  dependencies: {
    'gnome.org/glib': 2,
    'gnu.org/gettext': "^0.21",
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': "^0.29",
    'mesonbuild.com': "^0.63",
    'ninja-build.org': 1,
    'gnome.org/libxml2': 2,
  },
  distributable: {
    url: "https://gitlab.freedesktop.org/xdg/shared-mime-info/-/archive/{{version.raw}}/shared-mime-info-{{version.raw}}.tar.bz2",
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: "sed -i.bak -e '/fdatasync/d' meson.build\nrm meson.build.bak\n",
        if: "darwin",
        'working-directory': "..",
      },
      "meson .. --prefix={{prefix}} --buildtype=release",
      "ninja",
      "ninja install",
      {
        run: "./update-mime-database ../share/mime",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      CXXFLAGS: "$CXXFLAGS -std=c++17 -Wno-reserved-user-defined-literal",
      linux: {
        LDFLAGS: "$LDFLAGS -lstdc++fs",
      },
    },
  },
}
