import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/polkit',
  name: 'polkit',
  programs: [
    'pkaction',
    'pkcheck',
    'pkexec',
    'pkttyagent',
  ],
  dependencies: {
    'gnome.org/glib': '^2.78',
    'duktape.org': '^2.7',
    'gnome.org/gobject-introspection': '^1.72',
    'freedesktop.org/dbus': '^1.12',
    'linux-pam.org': '^1.4',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'gnu.org/gettext': '*',
    'gnome.org/libxslt': '*',
  },
  distributable: {
    url: 'https://www.freedesktop.org/software/polkit/releases/polkit-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup $MESON_ARGS build',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'pkttyagent --version | grep {{version.major}}',
    ],
  },
}
