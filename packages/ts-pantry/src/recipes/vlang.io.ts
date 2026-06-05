import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vlang.io',
  name: 'v',
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io',
  github: 'https://github.com/vlang/v',
  programs: ['v'],
  versionSource: {
    // Track V's STABLE tagged releases (e.g. 0.5.1) only — the repo also
    // publishes unstable `weekly.YYYY.WW` snapshots as GitHub releases. The
    // tagPattern keeps resolution on semver-style stable tags, which are the
    // ones that ship the official prebuilt `v_<os>.zip` archives.
    type: 'github-releases',
    repo: 'vlang/v',
    tagPattern: /^(\d+\.\d+(?:\.\d+)?)$/,
  },
  // Prebuilt download: V ships official per-platform prebuilt archives
  // (`v_<os>[_arch].zip`) on its GitHub releases. Each archive extracts to a
  // full `v/` toolchain tree (the `v` binary plus its `vlib`/`cmd`/`thirdparty`
  // support tree, which V needs at runtime to compile). The source build
  // bootstraps via a pinned `vc` C snapshot and is brittle across versions;
  // the official prebuilt is the exact same toolchain with none of that risk.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="v_macos_arm64"  ;;',
      '  darwin+x86-64)  ASSET="v_macos_x86_64" ;;',
      '  linux+aarch64)  ASSET="v_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="v_linux"        ;;',
      'esac',
      '',
      'curl -Lfo v.zip "https://github.com/vlang/v/releases/download/${VERSION}/${ASSET}.zip"',
      'unzip -q v.zip',
      '',
      '# The archive extracts to a `v/` directory holding the whole toolchain.',
      '# V needs its support tree (vlib/cmd/thirdparty) alongside the binary at',
      '# runtime, so install the entire tree into libexec and link the binary.',
      'mkdir -p {{prefix}}/libexec',
      'cp -R v {{prefix}}/libexec/v',
      'mkdir -p {{prefix}}/bin',
      'ln -sf ../libexec/v/v {{prefix}}/bin/v',
    ],
  },

  test: {
    script: [
      'v version',
    ],
  },
}
