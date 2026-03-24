import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'rust-script.org',
  name: 'rust-script',
  description: 'Run Rust files and expressions as scripts without any setup or compilation step.',
  homepage: 'https://rust-script.org',
  github: 'https://github.com/fornwall/rust-script',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'fornwall/rust-script',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/fornwall/rust-script/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cp $FIXTURE rand.rs',
      'chmod +x rand.rs',
      'rust-script rand.rs',
      'rust-script rand.rs | grep -E \\A random number:\\',
      './rand.rs | grep -E \\A random number:\\',
      'sed -i \\1d\\ rand.rs',
      'chmod -x rand.rs',
      'pkgx rand.rs | grep -E \\A random number:\\',
    ],
  },
}
