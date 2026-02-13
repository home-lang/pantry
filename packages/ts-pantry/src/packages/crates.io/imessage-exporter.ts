/**
 * **imessage-exporter** - Command-line tool to export and inspect local iMessage database
 *
 * @domain `crates.io/imessage-exporter`
 * @programs `imessage-exporter`
 * @version `3.3.1` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/imessage-exporter`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioimessageexporter
 * console.log(pkg.name)        // "imessage-exporter"
 * console.log(pkg.description) // "Command-line tool to export and inspect local i..."
 * console.log(pkg.programs)    // ["imessage-exporter"]
 * console.log(pkg.versions[0]) // "3.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/imessage-exporter.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioimessageexporterPackage = {
  /**
   * The display name of this package.
   */
  name: 'imessage-exporter' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/imessage-exporter' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line tool to export and inspect local iMessage database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/imessage-exporter/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ReagentX/imessage-exporter' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/imessage-exporter' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/imessage-exporter -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/imessage-exporter' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'imessage-exporter',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.3.1',
    '3.3.0',
    '3.2.1',
    '3.2.0',
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.8.0',
    '2.7.1',
    '2.7.0',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.1',
  ] as const,
  aliases: [] as const,
}

export type CratesioimessageexporterPackage = typeof cratesioimessageexporterPackage
