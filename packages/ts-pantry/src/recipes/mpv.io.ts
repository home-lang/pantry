import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    url: 'git+https://github.com/mpv-player/mpv',
  },
  dependencies: {
    'ffmpeg.org': '*',
    'libjpeg-turbo.org': '2',
    'libarchive.org': '3',
    'videolan.org/libplacebo': '6',
    'littlecms.com': '2',
    'luajit.org': '2',
    'mujs.com': '1',
    'freedesktop.org/uchardet': '0',
    'yt-dlp.org': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '1',
    'ninja-build.org': '1',
    'git-scm.org': '2',
    'invisible-island.net/ncurses': '6',
  },

  build: {
    script: [
      'if test -d $NCURSES_INCLUDE; then',
      '  mv $NCURSES_INCLUDE ${NCURSES_INCLUDE}.bak',
      'fi',
      '',
      'meson setup build $ARGS',
      'meson compile -C build',
      'meson install -C build',
      'if test -d ${NCURSES_INCLUDE}.bak; then',
      '  mv ${NCURSES_INCLUDE}.bak $NCURSES_INCLUDE',
      'fi',
      '',
      'cd "${{prefix}}/bin"',
      'patchelf --replace-needed {{deps.mujs.com.prefix}}/lib/pkgconfig/../../lib/libmujs.so libmujs.so mpv',
    ],
    env: {
      'ARGS': ['-Djavascript=enabled', '-Dlibmpv=true', '-Dlua=luajit', '-Dlibarchive=enabled', '-Duchardet=enabled', '-Dvapoursynth=disabled', '-Dmanpage-build=disabled', '--sysconfdir={{prefix}}/etc', '--datadir={{prefix}}/share', '--prefix={{prefix}}', '--buildtype=release'],
    },
  },
}
