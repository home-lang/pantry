import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tectonic-typesetting.github.io',
  name: 'tectonic',
  description: 'A modernized, complete, self-contained TeX/LaTeX engine, powered by XeTeX and TeXLive.',
  homepage: 'https://tectonic-typesetting.github.io/',
  github: 'https://github.com/tectonic-typesetting/tectonic',
  programs: ['tectonic'],
  versionSource: {
    type: 'github-releases',
    repo: 'tectonic-typesetting/tectonic',
    tagPattern: /^tectonic@(.+)$/,
  },
  distributable: {
    url: 'https://github.com/tectonic-typesetting/tectonic/archive/refs/tags/tectonic@{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'freetype.org': '*',
    'graphite.sil.org': '*',
    'harfbuzz.org': '*',
    'libpng.org': '*',
    'openssl.org': '^1.1',
    'unicode.org': '^71',
    // Tectonic requires fontconfig on every platform except macOS (which uses
    // CoreText). Its build.rs probes pkg-config for `fontconfig`; without it the
    // cargo build fails on Linux. pkgx pulled this in transitively; we declare it
    // explicitly. See tectonic docs/howto/build-tectonic/external-dep-install.
    linux: {
      'freedesktop.org/fontconfig': '*',
    },
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'rust-lang.org': '>=1.48.0',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --features external-harfbuzz --locked --path . --root {{prefix}}',
    ],
    env: {
      OPENSSL_DIR: '{{deps.openssl.org.prefix}}',
    },
  },
}
