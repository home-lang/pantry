import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'npmjs.com/pake-cli',
  name: 'pake-cli',
  programs: [
    'pake',
  ],
  dependencies: {
    'nodejs.org': '>=16',
    'npmjs.com': '*',
    'rust-lang.org': '>=1.63',
    'rust-lang.org/cargo': '*',
    darwin: {
      'github.com/create-dmg/create-dmg': 1,
    },
    linux: {
      'freedesktop.org/pkg-config': '^0.29',
      'cairographics.org': 1,
      'gnome.org/pango': 1,
      'gnome.org/gdk-pixbuf': 2,
      'gnome.org/atk': 2,
      'libsoup.org': '~2.74',
      'gnome.org/librsvg': 2,
      'gnome.org/vala': 0,
      'gtk.org/gtk3': 3,
    },
  },
  distributable: {
    url: 'https://github.com/tw93/Pake/archive/refs/tags/V{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/var version = ".*";/var version = {{version}};/\' cli.js',
        'working-directory': 'dist',
      },
      'npm install --global --prefix={{prefix}} --install-links .',
    ],
  },
  test: {
    script: [
      'test "$(pake --version)" = {{version}}',
      'pake --name pkgx pkgx.sh --targets=deb',
    ],
  },
}
