import type { Recipe } from '../../../../scripts/recipe-types'

// Download recipe: mail publishes prebuilt binaries for linux & macOS (x86_64 +
// arm64) as GitHub release assets (mail-<arch>-<os>.zip), built and attached by its
// own release workflow via the Pantry action. We fetch the matching asset per
// platform — no source build.
export const recipe: Recipe = {
  domain: 'github.com/mail-os/mail',
  name: 'mail',
  description: 'Self-hostable mail server (SMTP/IMAP) with a built-in webmail UI.',
  homepage: 'https://github.com/mail-os/mail',
  github: 'https://github.com/mail-os/mail',
  platforms: ['darwin', 'linux'],
  programs: ['mail'],
  versionSource: {
    type: 'github-releases',
    repo: 'mail-os/mail',
  },

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="mail-aarch64-macos" ;;',
      '  darwin+x86-64)  ASSET="mail-x86_64-macos"  ;;',
      '  linux+aarch64)  ASSET="mail-aarch64-linux" ;;',
      '  linux+x86-64)   ASSET="mail-x86_64-linux"  ;;',
      'esac',
      '',
      'curl -Lfo mail.zip "https://github.com/mail-os/mail/releases/download/v${VERSION}/${ASSET}.zip"',
      'unzip -o mail.zip',
      'install -Dm755 "${ASSET}" {{prefix}}/bin/mail',
    ],
  },
}
