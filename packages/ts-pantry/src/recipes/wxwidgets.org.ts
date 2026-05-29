import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wxwidgets.org',
  name: 'wxwidgets',
  description: 'Cross-Platform C++ GUI Library',
  homepage: 'https://www.wxwidgets.org',
  github: 'https://github.com/wxWidgets/wxWidgets',
  programs: ['wx-config', 'wxrc'],
  versionSource: {
    type: 'github-releases',
    repo: 'wxWidgets/wxWidgets',
  },
  distributable: {
    url: 'https://github.com/wxWidgets/wxWidgets/releases/download/v{{version}}/wxWidgets-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
    'simplesystems.org/libtiff': '*',
    'pcre.org/v2': '*',
    'libexpat.github.io': '*',
    'zlib.net': '*',
    linux: {
      'x.org/sm': '*',
      'freedesktop.org/mesa-glu': '*',
      'gtk.org/gtk3': '*',
    },
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    linux: {
      'llvm.org': '<17', // still gets unassigned label errors
      'gnu.org/make': '*',
    },
  },

  build: {
    script: [
      { run: 'rm -r catch pcre', 'working-directory': '3rdparty' },
      { run: 'rm -r expat jpeg png tiff zlib', 'working-directory': 'src' },
      './configure $CONFIGURE_ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: [
          'rm wx-config',
          'ln -s ../lib/wx/config/$WX_CONFIG wx-config',
        ],
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        '--prefix={{prefix}}',
        '--enable-clipboard',
        '--enable-controls',
        '--enable-dataviewctrl',
        '--enable-display',
        '--enable-dnd',
        '--enable-graphics_ctx',
        '--enable-svg',
        '--enable-webviewwebkit',
        '--with-expat',
        '--with-libjpeg',
        '--with-libpng',
        '--with-libtiff',
        '--with-opengl',
        '--with-zlib',
        '--disable-dependency-tracking',
        '--disable-tests',
        '--disable-precomp-headers',
        '--disable-monolithic',
      ],
      linux: {
        WX_CONFIG: 'gtk3-unicode-{{version.marketing}}',
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
      darwin: {
        WX_CONFIG: 'osx_cocoa-unicode-{{version.marketing}}',
        CONFIGURE_ARGS: [
          '--with-macosx-version-min=$MACOSX_DEPLOYMENT_TARGET',
          '--with-osx_cocoa',
          '--with-libiconv',
        ],
      },
    },
  },
}
