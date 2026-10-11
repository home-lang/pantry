/**
 * **mail** - pkgx package
 *
 * @domain `github.com/mail-os/mail`
 * @programs `mail`
 *
 * @install `pantry install github.com/mail-os/mail`
 * @buildDependencies `ziglang.org@0.16.0-dev`, `sqlite.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcommailosmail
 * console.log(pkg.name)        // "mail"
 * console.log(pkg.programs)    // ["mail"]
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/mail-os/mail.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/mail-os/mail' as const,
  pantryInstallCommand: 'pantry install github.com/mail-os/mail' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mail',
  ] as const,
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
  versions: [
    '0.3.26',
    '0.3.25',
    '0.3.24',
    '0.3.23',
    '0.3.22',
    '0.3.21',
    '0.3.20',
    '0.3.19',
    '0.3.18',
    '0.3.17',
    '0.3.13',
    '0.3.12',
    '0.3.11',
    '0.3.10',
    '0.3.9',
    '0.3.8',
    '0.3.7',
    '0.3.5',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.2.1',
    '0.2.0',
    '0.1.11',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.2',
    '0.0.1',
  ] as const,
  aliases: [] as const,
}

export type MailPackage = typeof mailPackage
