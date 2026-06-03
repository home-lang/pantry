import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "libsdl.org/SDL_mixer",
  name: "SDL_mixer",
  programs: [],
  dependencies: {
    'libsdl.org': "*",
    'mpg123.de': "*",
    'wavpack.com': ">=4",
    'xiph.org/vorbis': "*",
    'cmake.org': "*",
  },
  buildDependencies: {
    'pkgx.sh': ">=1",
  },
  distributable: {
    url: "https://github.com/libsdl-org/SDL_mixer/releases/download/release-{{version}}/SDL{{version.major}}_mixer-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "source <(pkgx +libsdl.org@{{version.major}})",
      {
        run: "./configure $ARGS\nmake --jobs {{ hw.concurrency }} install",
        if: "<3.2",
      },
      {
        run: "export CMAKE_PREFIX_PATH=\{{pkgx.prefix}}/libsdl.org/v{{version.major}}:$CMAKE_PREFIX_PATH\\ncmake -S . -B build $CMAKE_ARGS\ncmake --build build\ncmake --install build",
        if: ">=3.2",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-music-gme",
        "--disable-music-midi-fluidsynth",
        "--disable-music-midi-native",
        "--disable-music-mod",
        "--disable-music-mp3-minimp3",
        "--disable-music-ogg-stb",
        "--disable-music-opus",
        "--enable-music-mp3-mpg123",
        "--enable-music-ogg-vorbis",
        "--enable-music-wavpack-dsd",
      ],
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DSDLMIXER_DEPS_SHARED=OFF",
        "-DSDLMIXER_VENDORED=OFF",
        "-DSDLMIXER_GME=OFF",
        "-DSDLMIXER_MIDI=OFF",
        "-DSDLMIXER_MOD=OFF",
        "-DSDLMIXER_MP3_DRMP3=OFF",
        "-DSDLMIXER_VORBIS_STB=OFF",
        "-DSDLMIXER_OPUS=OFF",
        "-DSDLMIXER_FLAC=OFF",
        "-DSDLMIXER_WAVPACK_DSD=ON",
        "-DSDLMIXER_TESTS=OFF",
        "-DSDLMIXER_EXAMPLES=OFF",
      ],
    },
  },
  test: {
    script: [
      "CC=$(command -v cc || command -v clang || command -v gcc || echo clang)",
      "pkgx +libsdl.org^2 $CC $FIXTURE -lSDL2_mixer",
      "pkgx +libsdl.org^3 $CC $FIXTURE -lSDL3_mixer",
      "./a.out",
    ],
  },
}
