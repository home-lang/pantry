import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rioterm.com',
  name: 'rio',
  description: 'A hardware-accelerated GPU terminal emulator focusing to run in desktops and browsers.',
  homepage: 'https://rioterm.com',
  github: 'https://github.com/raphamorim/rio',
  programs: ['rio'],
  versionSource: {
    type: 'github-releases',
    repo: 'raphamorim/rio',
  },
  distributable: {
    url: 'https://github.com/raphamorim/rio/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    linux: {
      'freedesktop.org/fontconfig': '*', // as of 0.2.33
    },
  },
  buildDependencies: {
    // rio's Cargo.toml/rust-toolchain.toml require rustc >=1.92 (was 1.85); --locked build fails on older rust
    'rust-lang.org': '>=1.92',
    'rust-lang.org/cargo': '*',
    linux: {
      'khronos.org/glslang': '*', // since 0.4.0
    },
  },

  build: {
    workingDirectory: 'frontends/rioterm',
    env: {
      linux: {
        RUSTFLAGS: '-C link-arg=-Wl,-lstdc++fs',
      },
    },
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
