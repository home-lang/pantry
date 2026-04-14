import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'portaudio.com',
  name: 'PortAudio',
  description: 'PortAudio is a cross-platform, open-source C language library for real-time audio input and output.',
  github: 'https://github.com/PortAudio/portaudio',
  programs: [],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'PortAudio/portaudio',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/PortAudio/portaudio/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'install -D include/pa_mac_core.h {{prefix}}/include/',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-mac-universal=no', '--enable-cxx'],
    },
  },
}
