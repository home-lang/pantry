import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ipfscluster.io',
  name: 'ipfscluster',
  programs: ['ipfs-cluster-follow', 'ipfs-cluster-ctl', 'ipfs-cluster-service'],
  versionSource: {
    type: 'github-releases',
    repo: 'ipfs-cluster/ipfs-cluster',
  },

  build: {
    script: [
      'case "{{hw.platform}}/{{hw.arch}}" in',
      '  darwin/aarch64) ARCH="darwin-arm64" ;;',
      '  darwin/x86-64) ARCH="darwin-amd64" ;;',
      '  linux/x86-64) ARCH="linux-amd64" ;;',
      '  linux/aarch64) ARCH="linux-arm64" ;;',
      '  *) echo "Unsupported platform" && exit 1 ;;',
      'esac',
      'mkdir -p "{{prefix}}/bin" /tmp/ipfs-extract',
      'for TOOL in ipfs-cluster-service ipfs-cluster-ctl ipfs-cluster-follow; do',
      '  curl -fSL -o /tmp/${TOOL}.tar.gz "https://dist.ipfs.tech/${TOOL}/v{{version}}/${TOOL}_v{{version}}_${ARCH}.tar.gz"',
      '  tar -xzf /tmp/${TOOL}.tar.gz -C /tmp/ipfs-extract',
      '  cp /tmp/ipfs-extract/${TOOL}/${TOOL} "{{prefix}}/bin/"',
      '  chmod +x "{{prefix}}/bin/${TOOL}"',
      'done',
    ],
  },
}
