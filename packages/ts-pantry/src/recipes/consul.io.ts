import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'consul.io',
  name: 'consul',
  description: 'Consul is a distributed, highly available, and data center aware solution to connect and configure applications across dynamic, distributed infrastructure.',
  homepage: 'https://www.consul.io',
  github: 'https://github.com/hashicorp/consul',
  programs: ['consul'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/consul',
  },
  // Prebuilt download: hashicorp ships official per-platform release zips
  // (bare binary at the archive root) on releases.hashicorp.com.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="darwin_arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin_amd64" ;;',
      '  linux+aarch64)  PLATFORM="linux_arm64"  ;;',
      '  linux+x86-64)   PLATFORM="linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo consul.zip "https://releases.hashicorp.com/consul/${VERSION}/consul_${VERSION}_${PLATFORM}.zip"',
      'unzip -q consul.zip',
      'install -Dm755 consul {{prefix}}/bin/consul',
    ],
  },
}
