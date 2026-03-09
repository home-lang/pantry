/**
 * **mail** - pkgx package
 *
 * @domain `github.com/mail-os/mail`
 *
 * @install `launchpad install github.com/mail-os/mail`
 * @buildDependencies `ziglang.org@0.16.0-dev`, `sqlite.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommailosmail
 * console.log(pkg.name)        // "mail"
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mail-os/mail.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mailPackage = {
  /**
  * The display name of this package.
  */
  name: 'mail' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/mail-os/mail' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mail-os/mail/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mail-os/mail' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/mail-os/mail' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mail-os/mail -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mail-os/mail' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'ziglang.org@0.16.0-dev',
    'sqlite.org',
  ] as const,
  versions: [] as const,
  aliases: [] as const,
}

export type MailPackage = typeof mailPackage
