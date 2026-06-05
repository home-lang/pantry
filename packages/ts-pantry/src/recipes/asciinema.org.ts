import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'asciinema.org',
  name: 'asciinema',
  description: 'Record and share terminal sessions',
  homepage: 'https://asciinema.org',
  github: 'https://github.com/asciinema/asciinema',
  programs: ['asciinema'],
  versionSource: {
    type: 'github-releases',
    repo: 'asciinema/asciinema',
  },
  distributable: {
    url: 'https://github.com/asciinema/asciinema/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '^3.12',
  },

  build: {
    script: [
      // asciinema 2.x is a Python package
      { run: 'python-venv.sh {{prefix}}/bin/asciinema', if: '<3' },
      // asciinema 3.x is a vanilla Rust CLI that ships official per-target
      // release binaries (single bare `asciinema` executable). Download the
      // official binary instead of compiling.
      {
        run: [
          'VERSION={{version}}',
          'case {{hw.platform}}+{{hw.arch}} in',
          '  darwin+aarch64) TARGET="aarch64-apple-darwin"       ;;',
          '  darwin+x86-64)  TARGET="x86_64-apple-darwin"        ;;',
          '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu"  ;;',
          '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu"   ;;',
          'esac',
          'curl -Lfo asciinema "https://github.com/asciinema/asciinema/releases/download/v${VERSION}/asciinema-${TARGET}"',
          'install -Dm755 asciinema {{prefix}}/bin/asciinema',
        ].join('\n'),
        if: '>=3',
      },
    ],
  },
}
