import type { Recipe } from '../../scripts/recipe-types'

// biome ships official prebuilt CLI binaries for every platform we target as a
// single plain binary named `biome-<os>-<arch>`. The release tag differs by major
// version: 1.x is tagged `cli/v<version>`, 2.x is tagged `@biomejs/biome@<version>`
// (the monorepo uses scoped per-crate tags). Download the official binary instead
// of compiling the CLI crate from source via cargo.
export const recipe: Recipe = {
  domain: 'biomejs.dev',
  name: 'biome',
  description: 'A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.',
  homepage: 'https://biomejs.dev/',
  github: 'https://github.com/biomejs/biome',
  programs: ['biome'],
  versionSource: {
    type: 'github-releases',
    repo: 'biomejs/biome',
    tagPattern: /(cli\/v|@biomejs\/biome@)(.+)$/,
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="biome-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="biome-darwin-x64" ;;',
      '  linux+aarch64)  ASSET="biome-linux-arm64" ;;',
      '  linux+x86-64)   ASSET="biome-linux-x64" ;;',
      'esac',
      '',
      '# 1.x releases are tagged cli/v<version>; 2.x as @biomejs/biome@<version>.',
      'MAJOR=$(echo "$VERSION" | cut -d. -f1)',
      'if [ "$MAJOR" -ge 2 ]; then',
      '  TAG="@biomejs/biome@${VERSION}"',
      'else',
      '  TAG="cli/v${VERSION}"',
      'fi',
      '',
      'URL="https://github.com/biomejs/biome/releases/download/${TAG}/${ASSET}"',
      'curl -Lfo biome "$URL"',
      'install -Dm755 biome {{prefix}}/bin/biome',
    ],
  },
  test: {
    script: [
      'biome --version',
      'biome --version | grep {{version}}',
    ],
  },
}
