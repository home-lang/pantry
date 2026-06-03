import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/fastfetch-cli/fastfetch',
  name: 'fastfetch',
  programs: [
    'fastfetch',
    'flashfetch',
  ],
  buildDependencies: {
    'cmake.org': '^3',
    'gnome.org/glib': '^2',
    'imagemagick.org': '^7',
    'python.org': '~3.12',
    'github.com/KhronosGroup/Vulkan-Loader': '^1',
    'sqlite.org': '^3',
    'zlib.net': '^1',
    linux: {
      'freedesktop.org/dbus': '^1',
      'elfutils.org': '^0',
      'x.org/x11': '^1',
      'x.org/xcb': '^1',
      'x.org/xrandr': '^1',
      'kernel.org/linux-headers': '^5',
      'mesa3d.org': '^24',
      'khronos.org/opencl-headers': '^2024',
      'wayland.freedesktop.org': '^1',
    },
  },
  distributable: {
    url: 'https://github.com/fastfetch-cli/fastfetch/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build -DCMAKE_INSTALL_PREFIX={{ prefix }} -DCMAKE_INSTALL_SYSCONFDIR={{ prefix }}/etc -Wno-dev',
      'cmake --build build',
      'cmake --install build',
    ],
  },
  test: {
    script: [
      'test "$(fastfetch --version)" = "fastfetch {{version}} ($ARCH)"',
      'sleep 5',
      'fastfetch --structure OS --pipe | grep OS',
    ],
  },
}
