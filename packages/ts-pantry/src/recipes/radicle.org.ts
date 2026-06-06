import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'radicle.org',
  name: 'radicle',
  description: 'Radicle CLI',
  homepage: 'https://app.radicle.network/alt-clients.radicle.eth/radicle-cli',
  github: 'https://github.com/radicle-dev/radicle-cli',
  programs: ['rad', 'git-remote-rad', 'rad-account', 'rad-auth', 'rad-checkout', 'rad-clone', 'rad-edit', 'rad-ens', 'rad-gov', 'rad-help', 'rad-init', 'rad-inspect', 'rad-issue', 'rad-ls', 'rad-merge', 'rad-patch', 'rad-path', 'rad-pull', 'rad-push', 'rad-remote', 'rad-reward', 'rad-rm', 'rad-self', 'rad-sync', 'rad-track', 'rad-untrack'],
  platforms: ['darwin/x86-64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'radicle-dev/radicle-cli',
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64) ASSET=radicle-cli-x86_64-apple-darwin.tar.gz ;;',
      '  linux+x86-64) ASSET=radicle-cli-x86_64-unknown-linux-musl.tar.gz ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}} (upstream ships darwin/x86-64 and linux/x86-64 only)" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/radicle-dev/radicle-cli/releases/download/v{{version}}/$ASSET"',
      'tar -xzf "$ASSET"',
      'DIR="${ASSET%.tar.gz}"',
      'mkdir -p {{prefix}}/bin {{prefix}}/share/man/man1',
      'find "$DIR" -maxdepth 1 -type f ! -name "*.gz" -exec install -m755 {} {{prefix}}/bin/ \\;',
      'find "$DIR" -maxdepth 1 -type f -name "*.1.gz" -exec install -m644 {} {{prefix}}/share/man/man1/ \\;',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/rad',
      'test -x {{prefix}}/bin/rad',
      'test -s {{prefix}}/bin/git-remote-rad',
      'test -s {{prefix}}/share/man/man1/rad.1.gz',
    ],
  },
}
