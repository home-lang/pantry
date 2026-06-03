import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/zsh-users/zsh-completions",
  name: "zsh-completions",
  programs: [],
  dependencies: {
    'zsh.sourceforge.io': "*",
  },
  distributable: {
    url: "https://github.com/zsh-users/zsh-completions/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}/share",
      "cp -r src/_* {{prefix}}/share/",
    ],
  },
  test: {
    script: [
      "cat << EOF > test.zsh\nfpath=($ZSH_COMPLETIONS_ROOT/share $fpath)\nautoload _ack\nwhich _ack\nEOF\n",
      "zsh test.zsh | grep _ack",
    ],
  },
}
