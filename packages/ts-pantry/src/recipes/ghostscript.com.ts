import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ghostscript.com',
  name: 'ghostscript',
  description: 'This is purely for downloads, please check the website for full information',
  homepage: 'https://www.ghostscript.com/',
  github: 'https://github.com/ArtifexSoftware/ghostpdl-downloads',
  programs: ['dvipdf', 'eps2eps', 'gpcl6', 'gpcl6c', 'gpdlc', 'gs', 'gsbj', 'gsc', 'gsdj', 'gsdj500', 'gslj', 'gslp', 'gsnd', 'gsx', 'gxps', 'gxpsc', 'lprsetup.sh', 'pdf2dsc', 'pdf2ps', 'pf2afm', 'pfbtopfa', 'pphs', 'printafm', 'ps2ascii', 'ps2epsi', 'ps2pdf', 'ps2pdf12', 'ps2pdf13', 'ps2pdf14', 'ps2pdfwr', 'ps2ps', 'ps2ps2', 'unix-lpr.sh'],
  versionSource: {
    type: 'github-releases',
    repo: 'ArtifexSoftware/ghostpdl-downloads/releases',
    tagPattern: /\/^Ghostscript\\/GhostPDL \//,
  },
  dependencies: {
    'zlib.net': '^1.2',
    'libpng.org': '^1.6',
    'littlecms.com': '^2.15',
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
      '# Download ghostpdl source — tag format requires zero-padded minor',
      'GS_MAJOR="{{version.major}}"',
      'GS_MINOR="{{version.minor}}"',
      'GS_PATCH="{{version.patch}}"',
      'GS_PADDED_MINOR=$(printf "%02d" "$GS_MINOR")',
      'GS_TAG="gs${GS_MAJOR}${GS_PADDED_MINOR}${GS_PATCH}"',
      'GS_RAW="${GS_MAJOR}.${GS_PADDED_MINOR}.${GS_PATCH}"',
      'GS_URL="https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/${GS_TAG}/ghostpdl-${GS_RAW}.tar.xz"',
      'echo "Downloading ghostpdl from: $GS_URL"',
      '# Use env -i to avoid LD_LIBRARY_PATH conflict with deps curl.se',
      'env -i PATH="/usr/bin:/bin:/usr/sbin:/sbin" HOME="$HOME" curl -fSL -o /tmp/ghostpdl.tar.xz "$GS_URL"',
      'tar xJf /tmp/ghostpdl.tar.xz --strip-components=1',
      'rm -rf expat freetype jbig2dec lcms2mt libpng openjpeg zlib',
      'sed -i -e\'s/-mfpu=neon//g\' tesseract/CMakeLists.txt tesseract/configure.ac configure.ac configure',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'ARGS': ['--prefix="{{prefix}}"', '--disable-compile-inits', '--disable-cups', '--disable-gtk', '--without-x', '--without-versioned-path', '--without-libidn-prefix'],
      'CFLAGS': '$CFLAGS -Wno-int-conversion',
    },
  },
}
