import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terraform.io',
  name: 'terraform',
  description: 'Terraform enables you to safely and predictably create, change, and improve infrastructure. It is a source-available tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.',
  homepage: 'https://www.terraform.io',
  github: 'https://github.com/hashicorp/terraform',
  programs: ['terraform'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/terraform',
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
      'curl -Lfo terraform.zip "https://releases.hashicorp.com/terraform/${VERSION}/terraform_${VERSION}_${PLATFORM}.zip"',
      'unzip -q terraform.zip',
      'install -Dm755 terraform {{prefix}}/bin/terraform',
    ],
  },
}
