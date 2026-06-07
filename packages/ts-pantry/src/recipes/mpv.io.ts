import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mpv.io',
  name: 'mpv',
  description: 'Media player based on MPlayer and mplayer2',
  homepage: 'https://mpv.io',
  github: 'https://github.com/mpv-player/mpv',
  programs: ['mpv'],
  versionSource: {
    type: 'github-releases',
    repo: 'mpv-player/mpv',
  },
  distributable: {
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`).
    // Without this the clone builds the default branch instead of the version.
    url: 'git+https://github.com/mpv-player/mpv',
    ref: '{{version.tag}}',
  },
  dependencies: {
    'ffmpeg.org': '*',
    'libjpeg-turbo.org': '2',
    'libarchive.org': '3',
    'github.com/libass/libass': '^0.17',
    'videolan.org/libplacebo': '6',
    'littlecms.com': '2',
    'luajit.org': '2',
    'mujs.com': '1',
    'freedesktop.org/uchardet': '0',
    'vapoursynth.com': '66',
    'yt-dlp.org': '*',
    'linux': {
      'alsa-project.org/alsa-lib': '1',
      'github.com/adah1972/libunibreak': '6',
    },
  },
  buildDependencies: {
    'mesonbuild.com': '1',
    'ninja-build.org': '1',
    'git-scm.org': '2',
    'invisible-island.net/ncurses': '6',
    'linux': {
      'nixos.org/patchelf': '0',
    },
  },

  build: {
    script: [
      // FIXME: this is an extreme measure, but otherwise swift tries to mix apple's 2008
      // ncurses with ours; ncurses isn't even used by us; it's brought in as part of
      // python being used by meson.
      {
        run: [
          'if test -d $NCURSES_INCLUDE; then',
          '  mv $NCURSES_INCLUDE ${NCURSES_INCLUDE}.bak',
          'fi',
        ],
        if: 'darwin',
      },
      'meson setup build $ARGS',
      'meson compile -C build',
      'meson install -C build',
      {
        run: [
          'if test -d ${NCURSES_INCLUDE}.bak; then',
          '  mv ${NCURSES_INCLUDE}.bak $NCURSES_INCLUDE',
          'fi',
        ],
        if: 'darwin',
      },
      // for some reason, fix-elf.ts doesn't catch this:
      {
        run: 'patchelf --replace-needed {{deps.mujs.com.prefix}}/lib/pkgconfig/../../lib/libmujs.so libmujs.so mpv',
        'working-directory': '{{prefix}}/bin',
        if: 'linux',
      },
    ],
    env: {
      'ARGS': ['-Djavascript=enabled', '-Dlibmpv=true', '-Dlua=luajit', '-Dlibarchive=enabled', '-Duchardet=enabled', '-Dvapoursynth=enabled', '-Dmanpage-build=disabled', '--sysconfdir={{prefix}}/etc', '--datadir={{prefix}}/share', '--prefix={{prefix}}', '--buildtype=release'],
      'darwin': {
        'NCURSES_INCLUDE': '{{deps.invisible-island.net/ncurses.prefix}}/include',
        // dyld[] missing symbol called
        'MACOSX_DEPLOYMENT_TARGET': '14.0',
      },
      'linux': {
        'CC': 'clang',
        'LD': 'clang',
      },
    },
  },
}
