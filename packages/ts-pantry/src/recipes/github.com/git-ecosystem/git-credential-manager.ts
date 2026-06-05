import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/git-ecosystem/git-credential-manager',
  name: 'git-credential-manager',
  programs: [
    'git-credential-manager',
  ],
  dependencies: {
    // The prebuilt is a self-contained .NET app (runtime bundled), but it shells
    // out to `git` at runtime and dynamically links system openssl/zlib/icu on
    // linux. Keep those as runtime deps; the dotnet SDK build dep is gone.
    'git-scm.org': '^2.27.0',
    'openssl.org': '^1.1.1',
    'unicode.org': '^71',
    'zlib.net': '^1.3',
  },
  versionSource: {
    type: 'github-releases',
    repo: 'git-ecosystem/git-credential-manager',
  },
  // Download the official prebuilt, self-contained .NET tarball instead of
  // building from source. Upstream ships per-platform tarballs for all four
  // targets we support (gcm-<os>-<arch>-<ver>.tar.gz on
  // github.com/git-ecosystem/git-credential-manager releases). The tarball is a
  // flat directory containing the native `git-credential-manager` host plus its
  // bundled .NET runtime files — the source build did the same thing (copying
  // the whole `out/.../bin` tree into {{prefix}}/bin), so this matches what we'd
  // produce while dropping the heavy dotnet SDK build dependency.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="osx-arm64"   ;;',
      '  darwin+x86-64)  TARGET="osx-x64"     ;;',
      '  linux+aarch64)  TARGET="linux-arm64" ;;',
      '  linux+x86-64)   TARGET="linux-x64"   ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/git-ecosystem/git-credential-manager/releases/download/v${VERSION}/gcm-${TARGET}-${VERSION}.tar.gz"',
      'curl -Lfo gcm.tar.gz "$URL"',
      'mkdir -p {{prefix}}/bin',
      'tar xzf gcm.tar.gz -C {{prefix}}/bin',
      'chmod +x {{prefix}}/bin/git-credential-manager',
    ],
  },
  test: {
    script: [
      'git-credential-manager --version',
    ],
  },
}
