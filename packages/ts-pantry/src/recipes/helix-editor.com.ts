import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/helix-editor.com',
  domain: 'helix-editor.com',
  name: 'hx',
  description: 'A post-modern modal text editor.',
  homepage: 'https://helix-editor.com',
  github: 'https://github.com/helix-editor/helix',
  programs: ['hx'],
  versionSource: {
    type: 'github-releases',
    repo: 'helix-editor/helix',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/helix-editor/helix/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      // https://github.com/helix-editor/helix/discussions/8440
      { run: 'patch -p1 <props/v23.10.0.patch', if: '23.10.0' },
      // The `gotmpl` tree-sitter grammar source used by some tagged releases
      // (e.g. 25.07.1) points at `dannylongeuay/tree-sitter-go-template`, which
      // has been deleted upstream (404 / "Repository not found"). helix's
      // `helix-term/build.rs` calls `fetch_grammars().expect(..)` and panics
      // when any grammar fails to fetch, breaking the whole build in CI with:
      //   fatal: could not read Username for 'https://github.com'
      // Repoint it at the maintained fork helix master switched to
      // (`ngalaiko/tree-sitter-go-template`). This sed is a no-op on versions
      // that don't reference the dead repo, so it's safe to run unconditionally.
      'sed -i.bak -e "s#https://github.com/dannylongeuay/tree-sitter-go-template#https://github.com/ngalaiko/tree-sitter-go-template#" -e "s#395a33e08e69f4155156f0b90138a6c86764c979#ca26229bafcd3f37698a2496c2a5efa2f07e86bc#" languages.toml && rm -f languages.toml.bak',
      'cargo install --locked --path helix-term --root {{prefix}}',
      // This directory is not used by helix, and takes up >1GB of space, so do
      // not include it in the helix package
      'rm -rf runtime/grammars/sources',
      'mkdir -p "{{prefix}}"/share',
      'cp -a runtime "{{prefix}}"/share',
    ],
  },
}
