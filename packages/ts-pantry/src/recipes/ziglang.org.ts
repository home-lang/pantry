import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ziglang.org',
  name: 'zig',
  description: 'General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.',
  homepage: 'https://ziglang.org/',
  github: 'https://github.com/ziglang/zig',
  programs: ['zig'],
  versionSource: {
    type: 'github-releases',
    repo: 'ziglang/zig/tags',
  },

  build: {
    script: [
      'VERSION="{{version}}"',
      'case "{{hw.platform}}+{{hw.arch}}" in',
      '  darwin+aarch64) PLATFORM="aarch64-macos" ;;',
      '  darwin+x86-64)  PLATFORM="x86_64-macos"  ;;',
      '  linux+aarch64)  PLATFORM="aarch64-linux" ;;',
      '  linux+x86-64)   PLATFORM="x86_64-linux"  ;;',
      'esac',
      '',
      '# Dev versions (sanitized: + replaced with _ for S3) need original version for download',
      '# Restore + from _ in dev versions for the download URL',
      'DOWNLOAD_VERSION="$VERSION"',
      'if echo "$VERSION" | grep -q "\\-dev"; then',
      '  DOWNLOAD_VERSION=$(echo "$VERSION" | sed "s/_/+/")',
      '  URL="https://ziglang.org/builds/zig-${PLATFORM}-${DOWNLOAD_VERSION}.tar.xz"',
      'else',
      '  URL="https://ziglang.org/download/${VERSION}/zig-${PLATFORM}-${VERSION}.tar.xz"',
      'fi',
      '',
      'curl -Lfo zig.tar.xz "$URL"',
      'tar Jxf zig.tar.xz',
      '',
      'install -Dm755 "zig-${PLATFORM}-${DOWNLOAD_VERSION}/zig" "{{prefix}}/bin/zig"',
      'cp -a "zig-${PLATFORM}-${DOWNLOAD_VERSION}/lib" "{{prefix}}"',
    ],
  },
}
