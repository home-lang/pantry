/**
 * **mailpit** - An email and SMTP testing tool with API for developers
 *
 * @domain `mailpit.axllent.org`
 * @programs `mailpit`
 * @version `1.29.4` (90 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install mailpit.axllent.org`
 * @homepage https://mailpit.axllent.org/
 * @dependencies `linux:curl.se/ca-certs` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@^1.20`, `nodejs.org@^18`, `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.mailpitaxllentorg
 * console.log(pkg.name)        // "mailpit"
 * console.log(pkg.description) // "An email and SMTP testing tool with API for dev..."
 * console.log(pkg.programs)    // ["mailpit"]
 * console.log(pkg.versions[0]) // "1.29.4" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/mailpit-axllent-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const mailpitaxllentorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mailpit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mailpit.axllent.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An email and SMTP testing tool with API for developers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mailpit.axllent.org/package.yml' as const,
  homepageUrl: 'https://mailpit.axllent.org/' as const,
  githubUrl: 'https://github.com/axllent/mailpit' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install mailpit.axllent.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mailpit.axllent.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install mailpit.axllent.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mailpit',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
    'nodejs.org@^18',
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.29.4',
    '1.29.3',
    '1.29.2',
    '1.29.1',
    '1.29.0',
    '1.28.4',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.11',
    '1.27.10',
    '1.27.9',
    '1.27.8',
    '1.27.7',
    '1.27.6',
    '1.27.5',
    '1.27.4',
    '1.27.3',
    '1.27.2',
  ] as const,
  aliases: [] as const,
}

export type MailpitaxllentorgPackage = typeof mailpitaxllentorgPackage
