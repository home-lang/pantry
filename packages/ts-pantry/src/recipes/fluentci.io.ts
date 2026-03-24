import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fluentci.io',
  name: 'fluentci',
  description: 'Set up and run your CI locally or in any CI Provider in a consistent way https://backdropbuild.com/builds/v4/fluentci',
  homepage: 'https://fluentci.io',
  github: 'https://github.com/fluentci-io/fluentci',
  programs: ['fluentci'],
  versionSource: {
    type: 'github-releases',
    repo: 'fluentci-io/fluentci',
  },

  build: {
    script: [
      'case "{{hw.platform}}/{{hw.arch}}" in',
      '  darwin/aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin/x86-64) TRIPLE="x86_64-apple-darwin" ;;',
      '  linux/x86-64) TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  linux/aarch64) TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  *) echo "Unsupported platform" && exit 1 ;;',
      'esac',
      'curl -fSL -o /tmp/fluentci.tar.gz "https://github.com/fluentci-io/fluentci/releases/download/v{{version}}/fluentci_v{{version}}_${TRIPLE}.tar.gz"',
      'mkdir -p /tmp/fluentci-extract "{{prefix}}/bin"',
      'tar -xzf /tmp/fluentci.tar.gz -C /tmp/fluentci-extract',
      'find /tmp/fluentci-extract -name fluentci -type f | head -1 | xargs -I{} cp {} "{{prefix}}/bin/fluentci"',
      'chmod +x "{{prefix}}/bin/fluentci"',
    ],
    skip: ['fix-patchelf'],
  },
}
