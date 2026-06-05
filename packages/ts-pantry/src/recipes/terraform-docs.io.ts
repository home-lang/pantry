import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terraform-docs.io',
  name: 'terraform-docs',
  description: 'Generate documentation from Terraform modules in various output formats',
  homepage: 'https://terraform-docs.io',
  github: 'https://github.com/terraform-docs/terraform-docs',
  programs: ['terraform-docs'],
  versionSource: {
    type: 'github-releases',
    repo: 'terraform-docs/terraform-docs',
    tagPattern: /^v(.+)$/,
  },
  // Prebuilt download: terraform-docs ships official per-platform release
  // tarballs (bare `terraform-docs` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="terraform-docs-v${VERSION}-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="terraform-docs-v${VERSION}-darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="terraform-docs-v${VERSION}-linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="terraform-docs-v${VERSION}-linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo terraform-docs.tar.gz "https://github.com/terraform-docs/terraform-docs/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf terraform-docs.tar.gz',
      'install -Dm755 terraform-docs {{prefix}}/bin/terraform-docs',
    ],
  },
}
