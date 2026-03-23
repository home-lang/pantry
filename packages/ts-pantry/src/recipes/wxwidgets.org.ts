import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'cd "3rdparty"',
      'rm -r catch pcre',
      'cd "src"',
      'rm -r expat jpeg png tiff zlib',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "${{prefix}}/bin"',
      'rm wx-config',
      'ln -s ../lib/wx/config/$WX_CONFIG wx-config',
      '',
    ],
    env: {
      'CONFIGURE_ARGS': ['--prefix={{prefix}}', '--enable-clipboard', '--enable-controls', '--enable-dataviewctrl', '--enable-display', '--enable-dnd', '--enable-graphics_ctx', '--enable-svg', '--enable-webviewwebkit', '--with-expat', '--with-libjpeg', '--with-libpng', '--with-libtiff', '--with-opengl', '--with-zlib', '--disable-dependency-tracking', '--disable-tests', '--disable-precomp-headers', '--disable-monolithic'],
    },
  },
}
