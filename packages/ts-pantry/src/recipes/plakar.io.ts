import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'plakar.io',
  name: 'plakar',
  description: '',
  homepage: '',
  programs: ['plakar'],

  build: {
    script: [
    'case "{{hw.platform}}/{{hw.arch}}" in',
    '  darwin/aarch64) SUFFIX="darwin_arm64" ;;',
    '  darwin/x86-64) SUFFIX="darwin_amd64" ;;',
    '  linux/x86-64) SUFFIX="linux_amd64" ;;',
    '  linux/aarch64) SUFFIX="linux_arm64" ;;',
    '  *) echo "Unsupported platform" && exit 1 ;;',
    'esac',
    'TARBALL="plakar_{{version}}_${SUFFIX}.tar.gz"',
    'curl -fSL -o /tmp/plakar.tar.gz "https://github.com/PlakarKorp/plakar/releases/download/v{{version}}/${TARBALL}"',
    'mkdir -p /tmp/plakar-extract',
    'tar -xzf /tmp/plakar.tar.gz -C /tmp/plakar-extract',
    'mkdir -p "{{prefix}}/bin"',
    'cp /tmp/plakar-extract/plakar "{{prefix}}/bin/"',
    'chmod +x "{{prefix}}/bin/plakar"',
    ],
  },
}
