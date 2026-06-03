import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/romanz/trezor-agent",
  name: "trezor-agent",
  programs: [
    "jade-agent",
    "jade-gpg",
    "jade-gpg-agent",
    "keepkey-agent",
    "keepkeyctl",
    "ledger-agent",
    "ledger-gpg",
    "ledger-gpg-agent",
    "onlykey-agent",
    "onlykey-cli",
    "onlykey-gpg",
    "onlykey-gpg-agent",
    "trezor-agent",
    "trezor-gpg",
    "trezor-gpg-agent",
    "trezor-signify",
    "trezorctl",
  ],
  dependencies: {
    'python.org': "~3.12",
    'libusb.info': "^1",
    darwin: {
      'libpng.org': "~1.6",
    },
  },
  buildDependencies: {
    'git-scm.org': "*",
  },
  distributable: {
    url: "https://github.com/romanz/trezor-agent/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "python -m pip install --prefix=\"{{prefix}}\" -e .",
      {
        run: "for AGENT in $AGENTS; do\n  python -m pip install --prefix=\"{{prefix}}\" -e agents/$AGENT\ndone\n",
      },
      {
        run: "fix-shebangs.ts *",
        'working-directory': "${{prefix}}/bin",
      },
      {
        run: "rm libpng16.16.dylib",
        if: "darwin",
        'working-directory': "${{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages/PIL/.dylibs",
      },
    ],
    env: {
      AGENTS: [
        "jade",
        "keepkey",
        "ledger",
        "onlykey",
        "trezor",
      ],
    },
  },
}
