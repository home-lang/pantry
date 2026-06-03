import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "microsoft.com/PowerShell",
  name: "PowerShell",
  programs: [
    "pwsh",
  ],
  dependencies: {
    'openssl.org': "^1.1",
    linux: {
      'unicode.org': "^71",
    },
  },
  buildDependencies: {
    'curl.se': "*",
  },
  distributable: undefined,
  build: {
    script: [
      "curl -L \"https://github.com/PowerShell/PowerShell/releases/download/{{version.tag}}/powershell-{{version}}-${PLATFORM}.tar.gz\" | tar zxf -",
      "chmod +x pwsh",
    ],
    env: {
      'darwin/aarch64': {
        PLATFORM: "osx-arm64",
      },
      'darwin/x86-64': {
        PLATFORM: "osx-x64",
      },
      'linux/aarch64': {
        PLATFORM: "linux-arm64",
      },
      'linux/x86-64': {
        PLATFORM: "linux-x64",
      },
    },
  },
  test: {
    script: [
      "LIBCV=$(getconf GNU_LIBC_VERSION | sed 's/^glibc //')\nif  semverator lt $LIBCV 2.33; then\n  echo \"Skipping test on glibc $LIBCV\"\n  exit 0\nfi\n",
      "test \"$(pwsh --version)\" = \"PowerShell {{version}}\"",
    ],
  },
}
