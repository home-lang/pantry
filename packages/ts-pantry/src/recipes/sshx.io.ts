import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'sshx.io',
  name: 'sshx',
  description: 'Fast, collaborative live terminal sharing over the web',
  homepage: 'https://sshx.io',
  github: 'https://github.com/ekzhang/sshx',
  programs: ['sshx'],
  versionSource: {
    type: 'github-releases',
    repo: 'ekzhang/sshx',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/ekzhang/sshx/archive/0782485cce686c2656357957a9352c59624aaf6b.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'protobuf.dev': '*',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
