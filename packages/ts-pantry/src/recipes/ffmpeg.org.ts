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
    tagPattern: /^n(.+)$/,
  },
  distributable: {
    url: 'https://ffmpeg.org/releases/ffmpeg-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'lame.sourceforge.io': '>=3.98.3',
    'libsdl.org': '^2',
    'freetype.org': '^2',
    'harfbuzz.org': '^8',
    'videolan.org/x264': '^0.164',
    'videolan.org/x265': '^3',
    'webmproject.org/libvpx': '~1.14',
    'opus-codec.org': '^1',
    'google.com/webp': '^1',
  },
  buildDependencies: {
    'x86-64': {
      'nasm.us': '2',
    },
  },

  build: {
    script: [
      '# --enable-libharfbuzz is not available in all versions',
      'if grep -q -- --enable-libharfbuzz configure; then',
      '  ARGS="$ARGS --enable-libharfbuzz"',
      'fi',
      '',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': [
        '--prefix={{prefix}}',
        '--enable-libfreetype',
        '--enable-libmp3lame',
        '--enable-shared',
        '--enable-libx264',
        '--enable-gpl', // required for x264
        '--enable-libx265',
        '--enable-libvpx',
        '--enable-libopus',
        '--enable-libwebp',
      ],
      'CFLAGS': ['-Wno-incompatible-function-pointer-types'],
    },
  },
}
