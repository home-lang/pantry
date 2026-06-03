import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/dbus',
  name: 'dbus',
  programs: [
    'dbus-cleanup-sockets',
    'dbus-daemon',
    'dbus-launch',
    'dbus-monitor',
    'dbus-run-session',
    'dbus-send',
    'dbus-test-tool',
    'dbus-update-activation-environment',
    'dbus-uuidgen',
  ],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'pagure.io/xmlto': '*',
    'libexpat.github.io': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    darwin: {
      'gnu.org/patch': '*',
    },
  },
  distributable: {
    url: 'https://dbus.freedesktop.org/releases/dbus/dbus-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'curl -L "$PATCH" | patch -p1',
        if: 'darwin',
      },
      'meson setup $MESON_ARGS build',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      PATCH: 'https://raw.githubusercontent.com/Homebrew/formula-patches/0a8a55872e/d-bus/org.freedesktop.dbus-session.plist.osx.diff',
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Ddbus_user=$(whoami)',
      ],
      darwin: {
        MESON_ARGS: [
          '-Dlaunchd_agent_dir={{prefix}}',
        ],
      },
    },
  },
  test: {
    script: [
      'dbus-daemon --version | grep {{version}}',
      'uuid=$(dbus-uuidgen)',
      'python -c "import uuid; uuid.UUID(\'$uuid\')"',
      'pkg-config --modversion dbus-{{version.major}} | grep {{version}}',
    ],
  },
}
