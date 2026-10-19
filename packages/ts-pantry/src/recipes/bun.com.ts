import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  // `bun.com`, not `bun.sh`, and the difference is what gets built where.
  //
  // The catalog calls this package `bun.com` - bun renamed its own domain - so
  // that is what `pantry install bun` resolves to, and the registry is asked
  // for binaries under that name. This recipe still said `bun.sh`, so every
  // artifact was published under a domain nothing looks up: the binary registry
  // answered "no versions" and the install fell through to npm's `bun` package,
  // a postinstall shim with no runtime in it.
  domain: 'bun.com',
  name: 'bun',
  description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one',
  homepage: 'https://bun.sh',
  github: 'https://github.com/oven-sh/bun',
  programs: ['bun', 'bunx'],
  platformProgramOverrides: { windows: ['bun.exe'] },
  versionSource: {
    type: 'github-releases',
    repo: 'oven-sh/bun',
    // Tags are `bun-v1.4.0`. The `v` has to be part of the pattern, not part
    // of the capture — capturing it yielded versions like `v1.4.0`, which are
    // not semver, so every release after the last hand-seeded one was dropped
    // on the floor and the catalog sat at 1.3.14 while bun shipped 1.4.
    tagPattern: /^bun-v(.+)$/,
    stable: true,
  },
  // Prebuilt download, not a source build: bun publishes per-platform zips.
  distributable: null,
  buildDependencies: {
    'curl.se': '*',
    'info-zip.org/unzip': '*',
  },

  build: {
    script: [
      // The asset name is bun's own triple, which matches neither pantry's
      // platform nor its arch spelling: `x86-64` is `x64` upstream, and the
      // OS/arch pair is joined with a dash. The previous script interpolated
      // `$PLATFORM` — a variable buildkit never exports — so the URL resolved
      // to `bun-.zip` and curl 404'd on every platform, for every version.
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="bun-darwin-aarch64" ;;',
      '  darwin+x86-64)  ASSET="bun-darwin-x64"     ;;',
      '  linux+aarch64)  ASSET="bun-linux-aarch64"  ;;',
      '  linux+x86-64)   ASSET="bun-linux-x64"      ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 42 ;;',
      'esac',
      '',
      'curl -Lfo bun.zip "https://github.com/oven-sh/bun/releases/download/bun-v{{version}}/${ASSET}.zip"',
      // `-j` flattens the `bun-<triple>/` directory the zip wraps everything in.
      'unzip -qj bun.zip',
      'install -Dm755 bun "{{prefix}}/bin/bun"',
      // Relative, so the link survives the tarball being unpacked anywhere.
      'ln -sf bun "{{prefix}}/bin/bunx"',
    ],
    skip: ['fix-patchelf'],
  },
}
