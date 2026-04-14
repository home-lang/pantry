import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ffmpeg.org',
  name: 'ffmpeg',
  description: 'Play, record, convert, and stream audio and video',
  homepage: 'https://ffmpeg.org/',
  github: 'https://github.com/FFmpeg/FFmpeg',
  programs: ['ffmpeg', 'ffplay', 'ffprobe'],
  versionSource: {
    type: 'github-releases',
    repo: 'FFmpeg/FFmpeg',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://ffmpeg.org/releases/ffmpeg-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'lame.sourceforge.io': '>=3.98.3',
    'freetype.org': '^2',
    'harfbuzz.org': '^8',
    'opus-codec.org': '^1',
    'google.com/webp': '^1',
  },
  buildDependencies: {},

  build: {
    script: [
      'if grep -q -- --enable-libharfbuzz configure; then',
      '  ARGS="$ARGS --enable-libharfbuzz"',
      'fi',
      '',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-libfreetype', '--enable-libmp3lame', '--enable-shared', '--enable-libx264', '--enable-gpl', '--enable-libx265', '--enable-libvpx', '--enable-libopus', '--enable-libwebp', '--disable-sdl2', '--disable-doc'],
      'CFLAGS': ['-Wno-incompatible-function-pointer-types'],
    },
  },
}
