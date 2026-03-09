export const githubcommailosmailPackage = {
  name: 'mail' as const,
  domain: 'github.com/mail-os/mail' as const,
  description: 'Modern SMTP and IMAP mail server written in Zig' as const,
  packageYmlUrl: 'https://github.com/home-lang/pantry/tree/main/packages/ts-pantry/src/pantry/github.com/mail-os/mail/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mail-os/mail' as const,
  installCommand: 'launchpad install github.com/mail-os/mail' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mail-os/mail -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mail-os/mail' as const,
  programs: [
    'mail',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [
    'ziglang.org@0.16.0-dev',
    'sqlite.org',
  ] as const,
  versions: [
    '0.0.2',
    '0.0.1',
  ] as const,
  aliases: [] as const,
}

export type GithubcommailosmailPackage = typeof githubcommailosmailPackage
