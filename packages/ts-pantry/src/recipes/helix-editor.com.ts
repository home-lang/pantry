import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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

  build: {
    script: [
      'run: patch -p1 <props/v23.10.0.patch',
      'cargo install --locked --path helix-term --root {{prefix}}',
      'rm -rf runtime/grammars/sources',
      'mkdir -p "{{prefix}}"/share',
      'cp -a runtime "{{prefix}}"/share',
    ],
  },
}
