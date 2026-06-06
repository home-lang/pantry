import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pulumi.io',
  name: 'pulumi',
  description: 'Pulumi - Infrastructure as Code in any programming language 🚀',
  homepage: 'https://pulumi.io/',
  github: 'https://github.com/pulumi/pulumi',
  programs: ['pulumi', 'pulumi-language-bun', 'pulumi-language-dotnet', 'pulumi-language-go', 'pulumi-language-java', 'pulumi-language-nodejs', 'pulumi-language-pcl', 'pulumi-language-python', 'pulumi-language-python-exec', 'pulumi-language-yaml', 'pulumi-resource-pulumi-nodejs', 'pulumi-resource-pulumi-python', 'pulumi-watch'],
  versionSource: {
    type: 'github-releases',
    repo: 'pulumi/pulumi',
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  // Prebuilt download: pulumi (Go) ships official per-platform release tarballs
  // (`pulumi-v<ver>-<os>-<arch>.tar.gz`) on github.com/pulumi/pulumi. Each archive
  // contains a `pulumi/` dir with the full CLI + language/resource plugin bin set
  // — identical to what the source build produced (which was failing on the Go
  // toolchain + the buildmode=pie segfault workaround). Install the whole bin set.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin-x64"   ;;',
      '  linux+aarch64)  ASSET="linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="linux-x64"    ;;',
      'esac',
      '',
      'URL="https://github.com/pulumi/pulumi/releases/download/v${VERSION}/pulumi-v${VERSION}-${ASSET}.tar.gz"',
      'curl -Lfo pulumi.tar.gz "$URL"',
      'tar xzf pulumi.tar.gz',
      '',
      'mkdir -p {{prefix}}/bin',
      'for f in pulumi/*; do',
      '  install -Dm755 "$f" "{{prefix}}/bin/$(basename "$f")"',
      'done',
    ],
  },

  test: {
    script: [
      'pulumi version | grep {{version}}',
    ],
  },
}
