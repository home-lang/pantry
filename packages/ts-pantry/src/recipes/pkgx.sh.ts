import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pkgx.sh',
  name: 'pkgx',
  description: 'Standalone binary that can run anything',
  homepage: 'https://pkgx.sh',
  github: 'https://github.com/pkgxdev/pkgx',
  programs: ['pkgx'],
  versionSource: {
    type: 'github-releases',
    repo: 'pkgxdev/pkgx',
  },
  distributable: {
    url: 'https://github.com/pkgxdev/pkgx/releases/download/v{{ version }}/pkgx-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'deno.land': '~2',
    'rust-lang.org': '^1.56',
    'perl.org': '5',
  },

  build: {
    script: [
      'cd "${{prefix}}/bin"',
      'deno task --config "$SRCROOT"/deno.jsonc compile',
      'cargo install --path crates/cli --root "{{prefix}}"',
      'strip \'{{prefix}}/bin/pkgx\'',
    ],
    skip: ['fix-patchelf'],
  },
}
