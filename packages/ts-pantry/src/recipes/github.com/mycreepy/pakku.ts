import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mycreepy/pakku",
  name: "pakku",
  programs: [
    "pakku",
  ],
  buildDependencies: {
    'go.dev': "^1.23",
    'goreleaser.com': "*",
    'git-scm.org': "*",
  },
  distributable: {
    url: "git+https://github.com/mycreepy/pakku",
  },
  build: {
    script: [
      {
        run: "if test \{{hw.arch}}\ = \"aarch64\"; then\n  export PLATFORM=${PLATFORM}_v8.0\nfi\n",
        if: ">=0.4.2",
      },
      "goreleaser build --clean --single-target --skip=validate --snapshot",
      "mkdir -p \{{ prefix }}\/bin",
      "mv dist/pakku_$PLATFORM/pakku \{{ prefix }}\/bin",
    ],
    env: {
      CGO_ENABLED: '0',
      'darwin/aarch64': {
        PLATFORM: "darwin_arm64",
      },
      'darwin/x86-64': {
        PLATFORM: "darwin_amd64_v1",
      },
      'linux/aarch64': {
        PLATFORM: "linux_arm64",
      },
      'linux/x86-64': {
        PLATFORM: "linux_amd64_v1",
      },
    },
  },
}
