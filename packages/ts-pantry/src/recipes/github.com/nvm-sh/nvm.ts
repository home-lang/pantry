import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nvm-sh/nvm",
  name: "nvm",
  programs: [
    "nvm-exec",
  ],
  dependencies: {
    linux: {
      'curl.se': "*",
    },
  },
  distributable: {
    url: "https://github.com/nvm-sh/nvm/archive/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "mkdir -p bin libexec etc/bash_completion.d",
        'working-directory': {{prefix}},
      },
      "install nvm.sh nvm-exec {{prefix}}/libexec/",
      "install bash_completion {{prefix}}/etc/bash_completion.d/nvm",
      {
        run: "ln -s ../libexec/nvm-exec || true\n",
        'working-directory': {{prefix}}/bin,
      },
      {
        run: "sed -i.bak \"s|unset NVM_CD_FLAGS|unset NVM_CD_FLAGS \\&\\& DIR=\\$DIR/../libexec|g\" nvm-exec\nrm *.bak\n",
        'working-directory': {{prefix}}/libexec,
      },
    ],
  },
  test: {
    script: [
      "NODE_VERSION=pkgx nvm-exec || echo $? | grep 127",
      "cat << EOF > .zshrc\n[ -s \"\\$NVM_DIR/libexec/nvm.sh\" ] && \\. \"\\$NVM_DIR/libexec/nvm.sh\"  # This loads nvm\n[ -s \"\\$NVM_DIR/etc/bash_completion.d/nvm\" ] && \\. \"\\$NVM_DIR/etc/bash_completion.d/nvm\"  # This loads nvm bash_completion\nEOF\nsource ./.zshrc\n",
      "cat << EOF > .profile\n[ -s \"\\$NVM_DIR/libexec/nvm.sh\" ] && \\. \"\\$NVM_DIR/libexec/nvm.sh\"  # This loads nvm\n[ -s \"\\$NVM_DIR/etc/bash_completion.d/nvm\" ] && \\. \"\\$NVM_DIR/etc/bash_completion.d/nvm\"  # This loads nvm bash_completion\nEOF\nsource ./.profile\n",
      "nvm install v12.14.1",
      "node -v | grep 12.14.1",
    ],
  },
}
