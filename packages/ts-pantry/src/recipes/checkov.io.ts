import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'checkov.io',
  name: 'checkov',
  description: 'Prevent cloud misconfigurations and find vulnerabilities during build-time in infrastructure as code, container images and open source packages with Checkov by Bridgecrew.',
  homepage: 'https://www.checkov.io/',
  github: 'https://github.com/bridgecrewio/checkov',
  programs: ['checkov'],
  versionSource: {
    type: 'github-releases',
    repo: 'bridgecrewio/checkov',
    tagPattern: /^(\d+\.\d+\.\d+)$/,
  },
  distributable: {
    url: 'https://github.com/bridgecrewio/checkov/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
    'stedolan.github.io/jq': '*',
    // checkov pulls in Rust-backed wheels (rustworkx, orjson). Upstream pkgx
    // pins specific Rust versions per-wheel via `pkgx +rust~1.xx`, but pkgx is
    // not on PATH in our buildkit — so we provide a Rust toolchain directly and
    // let the wheels build against ambient stable cargo/rustc.
    'rust-lang.org': '*',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      // Pre-build the Rust-backed wheels against the ambient cargo/rustc the
      // buildkit puts on PATH. The upstream `pkgx +rust~1.xx +cargo\<0.83`
      // prefix is dropped because `pkgx` is not available in this environment;
      // current stable Rust builds these wheels fine.
      {
        run: [
          '{{prefix}}/venv/bin/pip install "rustworkx$(jq -r .default.rustworkx.version Pipfile.lock | sed \'s/==/~=/\')"',
          '{{prefix}}/venv/bin/pip install "orjson$(jq -r .default.orjson.version Pipfile.lock | sed \'s/==/~=/\')"',
        ],
        if: '>=3.2.258',
      },
      '{{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} checkov',
    ],
    env: {
      // error: incompatible pointer to integer conversion initializing 'int' with an expression of type 'void *'
      linux: {
        CFLAGS: '-Wno-int-conversion',
      },
    },
  },
}
