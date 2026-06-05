import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/PowerShell',
  name: 'PowerShell',
  programs: [
    'pwsh',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    linux: {
      'unicode.org': '^71',
    },
  },
  buildDependencies: {
    'curl.se': '*',
  },
  // Prebuilt download: Microsoft ships official per-platform .NET self-contained
  // tarballs (`powershell-<ver>-<os>-<arch>.tar.gz`) on github.com/PowerShell/PowerShell.
  // The archive is a flat tree with the `pwsh` host plus its full managed-assembly
  // tree — it must be installed whole (like the V/helix pattern), so we drop the
  // tree under libexec and symlink `bin/pwsh` into it. Maps linux x64/arm64 +
  // osx x64/arm64. Tags are `v{{version}}`.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="osx-arm64"   ;;',
      '  darwin+x86-64)  PLATFORM="osx-x64"     ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64" ;;',
      '  linux+x86-64)   PLATFORM="linux-x64"   ;;',
      'esac',
      '',
      'curl -Lfo pwsh.tar.gz "https://github.com/PowerShell/PowerShell/releases/download/v${VERSION}/powershell-${VERSION}-${PLATFORM}.tar.gz"',
      'mkdir -p {{prefix}}/libexec/powershell',
      'tar zxf pwsh.tar.gz -C {{prefix}}/libexec/powershell',
      'chmod +x {{prefix}}/libexec/powershell/pwsh',
      'mkdir -p {{prefix}}/bin',
      'ln -sf ../libexec/powershell/pwsh {{prefix}}/bin/pwsh',
    ],
  },
  test: {
    script: [
      'test "$(pwsh --version)" = "PowerShell {{version}}"',
    ],
  },
}
