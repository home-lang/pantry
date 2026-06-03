import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mamba-org/micro",
  name: "micro",
  programs: [
    "micromamba",
  ],
  dependencies: {
    'curl.se/ca-certs': "*",
  },
  buildDependencies: {
    'curl.se': "*",
    'sourceware.org/bzip2': "*",
  },
  distributable: undefined,
  build: {
    script: [
      "curl -L \"https://github.com/mamba-org/micromamba-releases/releases/download/{{version.tag}}/micromamba-$PID.tar.bz2\" | tar xj",
      "rm -rf info",
    ],
    env: {
      'linux/x86-64': {
        PID: "linux-64",
      },
      'linux/aarch64': {
        PID: "linux-aarch64",
      },
      'darwin/x86-64': {
        PID: "osx-64",
      },
      'darwin/aarch64': {
        PID: "osx-arm64",
      },
    },
  },
  test: {
    script: [
      "micromamba | grep {{version}}",
      "if test \"$(sw_vers -productVersion | cut -d . -f 1)\" -lt 15; then\n  exit 0\nfi\n",
      "eval \"$(micromamba shell hook --shell $SH)\"",
      "micromamba create numpy --channel anaconda --prefix mm-prefix --yes",
      "micromamba activate mm-prefix",
      "./test.py",
    ],
  },
}
