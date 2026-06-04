import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pkl-lang.org',
  name: 'pkl-lang',
  description: 'A configuration as code language with rich validation and tooling.',
  homepage: 'https://pkl-lang.org',
  github: 'https://github.com/apple/pkl',
  programs: ['jpkl', 'pkl'],
  // `pkl` is a self-contained native binary; `jpkl` is a self-executing jar
  // that needs a JVM at runtime.
  dependencies: { 'openjdk.org': '*' },
  versionSource: {
    // Upstream release tags are bare X.Y.Z (no `v` prefix).
    type: 'github-releases',
    repo: 'apple/pkl',
    tagPattern: /^(\d.*)$/,
  },
  // Source build is a heavy GraalVM/Gradle native-image compile; upstream ships
  // ready-to-run native binaries per platform, so download those directly.
  distributable: null,
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'mkdir -p {{prefix}}/bin',
      'case "{{hw.platform}}-{{hw.arch}}" in\n'
      + '  darwin-aarch64) plat=macos-aarch64 ;;\n'
      + '  darwin-x86-64)  plat=macos-amd64 ;;\n'
      + '  linux-aarch64)  plat=linux-aarch64 ;;\n'
      + '  linux-x86-64)   plat=linux-amd64 ;;\n'
      + '  *) echo "unsupported platform {{hw.platform}}-{{hw.arch}}" >&2; exit 1 ;;\n'
      + 'esac\n'
      + 'base="https://github.com/apple/pkl/releases/download/{{version}}"\n'
      + 'curl -fSL "$base/pkl-$plat" -o {{prefix}}/bin/pkl\n'
      + 'curl -fSL "$base/jpkl" -o {{prefix}}/bin/jpkl\n'
      + 'chmod +x {{prefix}}/bin/pkl {{prefix}}/bin/jpkl',
    ],
  },
}
