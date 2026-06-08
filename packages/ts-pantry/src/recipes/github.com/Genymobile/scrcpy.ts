import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Genymobile/scrcpy',
  platforms: ['darwin', 'linux/x86-64'],
  name: 'scrcpy',
  propsDir: '../../props/github.com/Genymobile/scrcpy',
  programs: [
    'scrcpy',
  ],
  dependencies: {
    'ffmpeg.org': '*',
    'libusb.info': '*',
    // scrcpy <4 builds against SDL2 (`dependency('sdl2', ...)`); the >=4 build
    // pulls SDL3 on demand via `pkgx +libsdl.org^3` in the script below. Pin the
    // base dep to SDL2 so `*` doesn't resolve to SDL3 and break the meson lookup.
    'libsdl.org': '^2',
    'pkgx.sh': '>=1',
    linux: {
      'webmproject.org/libvpx': '<1.15.1',
    },
    darwin: {
      'sourceware.org/bzip2': '*',
      'zlib.net': '*',
    },
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'gnu.org/wget': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/Genymobile/scrcpy/archive/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: 'patch -p1 < props/4135c411af419f4f86dc9ec9301c88012d616c49.diff',
        if: '>=2.3<2.3.2',
        'working-directory': '..',
      },
      'wget $PREBUILT_SERVER_URL -O scrcpy-server',
      {
        run: 'meson setup $ARGS ..',
        if: '<4',
      },
      {
        run: 'pkgx +libsdl.org^3 meson setup $ARGS ..',
        if: '>=4',
      },
      'meson compile --verbose',
      'meson install',
      {
        run: [
          'mv "../bin/scrcpy" .',
          'install -m755 $PROP "../bin/scrcpy"',
        ],
        prop: {
          content: [
            '#!/bin/sh',
            'set -e',
            '',
            'd=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)',
            'exec pkgx +libsdl.org^3 "$d/../libexec/scrcpy" "$@"',
          ],
        },
        if: '>=4',
        'working-directory': '{{prefix}}/libexec',
      },
    ],
    env: {
      PREBUILT_SERVER_URL: 'https://github.com/Genymobile/scrcpy/releases/download/v{{version.marketing}}/scrcpy-server-v{{version.marketing}}',
      ARGS: [
        '--prefix={{prefix}}',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dprebuilt_server=build/scrcpy-server',
        '--strip',
        '-Db_lto=true',
      ],
    },
  },
}
