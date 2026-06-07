import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wezfurlong.org/wezterm',
  name: 'wezterm',
  programs: [
    'wezterm',
  ],
  dependencies: {
    'zlib.net': '^1.3',
    linux: {
      'freetype.org': '*',
      'freedesktop.org/fontconfig': '*',
      'openssl.org': '^1.1',
      // WezTerm's GUI build links against X11/XCB, Wayland, libxkbcommon and EGL/GL
      // (mesa). pkgx relies on its ambient system providing these; a bare CI box does
      // not, so they are declared explicitly to satisfy build.rs link steps.
      'x.org/x11': '*',
      'x.org/xcb': '*',
      'xkbcommon.org': '*',
      'wayland.freedesktop.org': '*',
      'mesa3d.org': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.71<1.78',
    'rust-lang.org/cargo': '*',
    // pkg-config is required to locate the system libraries above during build.rs.
    linux: {
      'freedesktop.org/pkg-config': '*',
    },
  },
  // WezTerm's git tags are `YYYYMMDD-HHMMSS-<commit>` (e.g. 20240203-110809-5046fc22),
  // while the catalog version is the date-derived `YYYY.MM.DD` (2024.2.3). The build
  // harness's {{version.tag}} resolver cannot reconstruct the time+commit suffix from
  // the catalog version, so the `-src.tar.gz` URL is pinned to the real release tag.
  distributable: {
    url: 'https://github.com/wez/wezterm/releases/download/20240203-110809-5046fc22/wezterm-20240203-110809-5046fc22-src.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      ARGS: [
        '--locked',
        '--path=wezterm',
        '--root {{prefix}}',
      ],
    },
  },
}
