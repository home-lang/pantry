/**
 * **npm** - the package manager for JavaScript
 *
 * @domain `npmjs.com`
 * @programs `npm`, `npx`
 * @version `11.8.0` (72 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install npmjs.com`
 * @aliases `npm`
 * @homepage https://docs.npmjs.com/cli/
 * @dependencies `nodejs.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.npm
 * // Or access via domain
 * const samePkg = pantry.npmjscom
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "npmjs"
 * console.log(pkg.description) // "the package manager for JavaScript"
 * console.log(pkg.programs)    // ["npm", "npx"]
 * console.log(pkg.versions[0]) // "11.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/npmjs-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const npmPackage = {
  /**
   * The display name of this package.
   */
  name: 'npmjs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'npmjs.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'the package manager for JavaScript' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/npmjs.com/package.yml' as const,
  homepageUrl: 'https://docs.npmjs.com/cli/' as const,
  githubUrl: 'https://github.com/npm/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install npmjs.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +npmjs.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install npmjs.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'npm',
    'npx',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '11.8.0',
    '11.7.0',
    '11.6.4',
    '11.6.3',
    '11.6.2',
    '11.6.1',
    '11.6.0',
    '11.5.2',
    '11.5.1',
    '11.5.0',
    '11.4.2',
    '11.4.1',
    '11.4.0',
    '11.3.0',
    '11.2.0',
    '11.1.0',
    '11.0.0',
    '10.9.4',
    '10.9.3',
    '10.9.2',
    '10.9.1',
    '10.9.0',
    '10.8.3',
    '10.8.2',
    '10.8.1',
    '10.8.0',
    '10.7.0',
    '10.6.0',
    '10.5.2',
    '10.5.1',
    '10.5.0',
    '10.4.0',
    '10.3.0',
    '10.2.5',
    '10.2.4',
    '10.2.3',
    '10.2.2',
    '10.2.1',
    '10.2.0',
    '10.1.0',
    '10.0.0',
    '9.9.4',
    '9.9.3',
    '9.9.2',
    '9.9.1',
    '9.9.0',
    '9.8.1',
    '9.8.0',
    '9.7.2',
    '9.7.1',
    '9.7.0',
    '9.6.7',
    '9.6.6',
    '9.6.5',
    '9.6.4',
    '9.6.3',
    '9.6.2',
    '9.6.1',
    '9.6.0',
    '9.5.1',
    '9.5.0',
    '9.4.2',
    '9.4.1',
    '9.4.0',
    '9.3.1',
    '9.3.0',
    '9.2.0',
    '9.1.3',
    '9.1.2',
    '9.0.1',
    '8.19.4',
    '8.19.3',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [
    'npm',
  ] as const,
}

export type NpmPackage = typeof npmPackage
