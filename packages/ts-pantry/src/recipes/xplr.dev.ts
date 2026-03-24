import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xplr.dev',
  name: 'xplr',
  description: 'A hackable, minimal, fast TUI file explorer',
  homepage: 'https://xplr.dev',
  github: 'https://github.com/sayanarijit/xplr',
  programs: ['xplr'],
  versionSource: {
    type: 'github-releases',
    repo: 'sayanarijit/xplr',
  },
  distributable: {
    url: 'https://github.com/sayanarijit/xplr/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'mkdir .bin',
      'ln -s "$(command -v clang)" .bin/aarch64-linux-gnu-gcc',
      'export PATH="$PWD/.bin:$PATH"',
      '',
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
