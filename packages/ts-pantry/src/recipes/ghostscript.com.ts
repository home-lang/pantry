import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ghostscript.com',
  name: 'ghostscript',
  description: 'This is purely for downloads, please check the website for full information',
  homepage: 'https://www.ghostscript.com/',
  github: 'https://github.com/ArtifexSoftware/ghostpdl-downloads',
  programs: ['dvipdf', 'eps2eps', 'gpcl6', 'gpcl6c', 'gpdlc', 'gs', 'gsbj', 'gsc', 'gsdj', 'gsdj500', 'gslj', 'gslp', 'gsnd', 'gsx', 'gxps', 'gxpsc', 'lprsetup.sh', 'pdf2dsc', 'pdf2ps', 'pf2afm', 'pfbtopfa', 'pphs', 'printafm', 'ps2ascii', 'ps2epsi', 'ps2pdf', 'ps2pdf12', 'ps2pdf13', 'ps2pdf14', 'ps2pdfwr', 'ps2ps', 'ps2ps2', 'unix-lpr.sh'],
  versionSource: {
    type: 'github-releases',
    repo: 'ArtifexSoftware/ghostpdl-downloads',
    tagPattern: /^gs(.+)$/,
  },
  dependencies: {
    'zlib.net': '^1.2',
    'libpng.org': '^1.6',
    'libjpeg-turbo.org': '^2',
    'simplesystems.org/libtiff': '^4',
    'littlecms.com': '^2.15',
    'gnu.org/libidn': '^1.41',
    'freedesktop.org/fontconfig': '^2.14',
    'jbig2dec.com': '^0.19',
    'libexpat.github.io': '^2.5',
    'openjpeg.org': '^2.5',
    'freetype.org': '^2.13',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      '# Download ghostpdl source.',
      '# The pantry version is the concatenated tag digit string (e.g. tag gs10071 -> "10071"),',
      '# where minor is always 2 digits and patch always 1 digit (10.07.1 -> 10+07+1).',
      '# {{version.major}} resolves to that full digit string since the version has no dots.',
      'GS_DIGITS="{{version.major}}"',
      'GS_MAJOR="${GS_DIGITS%???}"',
      'GS_REST="${GS_DIGITS#"$GS_MAJOR"}"',
      'GS_MINOR="${GS_REST%?}"',
      'GS_PATCH="${GS_REST#"$GS_MINOR"}"',
      'GS_TAG="gs${GS_DIGITS}"',
      'GS_RAW="${GS_MAJOR}.${GS_MINOR}.${GS_PATCH}"',
      'GS_URL="https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/${GS_TAG}/ghostpdl-${GS_RAW}.tar.xz"',
      'echo "Downloading ghostpdl from: $GS_URL"',
      '# Use env -i to avoid LD_LIBRARY_PATH conflict with deps curl.se',
      'env -i PATH="/usr/bin:/bin:/usr/sbin:/sbin" HOME="$HOME" curl -fSL -o /tmp/ghostpdl.tar.xz "$GS_URL"',
      'tar xJf /tmp/ghostpdl.tar.xz --strip-components=1',
      // ensure our libs are used and nothing is vendored
      'rm -rf expat freetype jbig2dec jpeg lcms2mt libpng openjpeg tiff zlib',
      { run: 'sed -i -e\'s/-mfpu=neon//g\' tesseract/CMakeLists.txt tesseract/configure.ac configure.ac configure', if: 'linux/aarch64' },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'make install-so',
    ],
    env: {
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'ARGS': ['--prefix={{prefix}}', '--disable-compile-inits', '--disable-cups', '--disable-gtk', '--with-system-libtiff', '--without-x', '--without-versioned-path'],
      'CFLAGS': '$CFLAGS -Wno-int-conversion',
      'linux': {
        // since 10.5.1
        'CFLAGS': '-Wno-incompatible-pointer-types -fPIC $CFLAGS',
        'CXXFLAGS': '-fPIC $CXXFLAGS',
        'LDFLAGS': '-lstdc++fs $LDFLAGS',
      },
    },
  },
}
