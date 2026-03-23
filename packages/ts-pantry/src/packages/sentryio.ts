/**
 * **sentry-cli** - Command-line utility to interact with Sentry
 *
 * @domain `sentry.io`
 * @programs `sentry-cli`
 * @version `3.3.3` (80 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sentry.io`
 * @homepage https://docs.sentry.io/cli/
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`, `curl.se^8 # links to libcurl`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sentryio
 * console.log(pkg.name)        // "sentry-cli"
 * console.log(pkg.description) // "Command-line utility to interact with Sentry"
 * console.log(pkg.programs)    // ["sentry-cli"]
 * console.log(pkg.versions[0]) // "3.3.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sentry-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sentryioPackage = {
  /**
  * The display name of this package.
  */
  name: 'sentry-cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sentry.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command-line utility to interact with Sentry' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sentry.io/package.yml' as const,
  homepageUrl: 'https://docs.sentry.io/cli/' as const,
  githubUrl: 'https://github.com/getsentry/sentry-cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sentry.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sentry.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sentry.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sentry-cli',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
    'curl.se^8 # links to libcurl',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.0',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.58.5',
    '2.58.4',
    '2.58.3',
    '2.58.2',
    '2.58.1',
    '2.58.0',
    '2.57.0',
  ] as const,
  aliases: [] as const,
}

export type SentryioPackage = typeof sentryioPackage
