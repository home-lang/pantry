/**
 * **firebase** - The Firebase Command Line Tools
 *
 * @domain `google.com/firebase-tools`
 * @programs `firebase`
 * @version `15.4.0` (135 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/firebase-tools`
 * @homepage https://firebase.google.com/docs/cli/
 * @dependencies `nodejs.org`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomfirebasetools
 * console.log(pkg.name)        // "firebase"
 * console.log(pkg.description) // "The Firebase Command Line Tools"
 * console.log(pkg.programs)    // ["firebase"]
 * console.log(pkg.versions[0]) // "15.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/firebase-tools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomfirebasetoolsPackage = {
  /**
   * The display name of this package.
   */
  name: 'firebase' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'google.com/firebase-tools' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Firebase Command Line Tools' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/firebase-tools/package.yml' as const,
  homepageUrl: 'https://firebase.google.com/docs/cli/' as const,
  githubUrl: 'https://github.com/firebase/firebase-tools' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install google.com/firebase-tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/firebase-tools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/firebase-tools' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'firebase',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '15.4.0',
    '15.3.1',
    '15.3.0',
    '15.2.1',
    '15.2.0',
    '15.1.0',
    '15.0.0',
    '14.27.0',
    '14.26.0',
    '14.25.1',
    '14.25.0',
    '14.24.2',
    '14.24.1',
    '14.24.0',
    '14.23.0',
    '14.22.0',
    '14.21.0',
    '14.20.0',
    '14.19.1',
    '14.19.0',
    '14.18.0',
    '14.17.0',
    '14.16.0',
    '14.15.2',
    '14.15.1',
    '14.15.0',
    '14.14.0',
    '14.13.0',
    '14.12.1',
    '14.12.0',
    '14.11.2',
    '14.11.1',
    '14.11.0',
    '14.10.1',
    '14.10.0',
    '14.9.0',
    '14.8.0',
    '14.7.0',
    '14.6.0',
    '14.5.1',
    '14.5.0',
    '14.4.0',
    '14.3.1',
    '14.3.0',
    '14.2.2',
    '14.2.1',
    '14.2.0',
    '14.1.0',
    '14.0.1',
    '14.0.0',
    '13.35.1',
    '13.35.0',
    '13.34.0',
    '13.33.0',
    '13.32.0',
    '13.31.2',
    '13.31.1',
    '13.31.0',
    '13.30.0',
    '13.29.3',
    '13.29.2',
    '13.29.1',
    '13.29.0',
    '13.28.0',
    '13.27.0',
    '13.26.0',
    '13.25.0',
    '13.24.2',
    '13.24.1',
    '13.24.0',
    '13.23.1',
    '13.22.1',
    '13.22.0',
    '13.21.0',
    '13.20.2',
    '13.20.1',
    '13.20.0',
    '13.19.0',
    '13.18.0',
    '13.17.0',
    '13.16.0',
    '13.15.4',
    '13.15.3',
    '13.15.2',
    '13.15.1',
    '13.15.0',
    '13.14.2',
    '13.14.1',
    '13.14.0',
    '13.13.3',
    '13.13.2',
    '13.13.1',
    '13.13.0',
    '13.12.0',
    '13.11.4',
    '13.11.3',
    '13.11.2',
    '13.11.1',
    '13.11.0',
    '13.10.2',
    '13.10.1',
    '13.10.0',
    '13.9.0',
    '13.8.3',
    '13.8.2',
    '13.8.1',
    '13.8.0',
    '13.7.5',
    '13.7.4',
    '13.7.3',
    '13.7.2',
    '13.7.1',
    '13.7.0',
    '13.6.1',
    '13.6.0',
    '13.5.2',
    '13.5.1',
    '13.5.0',
    '13.4.1',
    '13.4.0',
    '13.3.1',
    '13.3.0',
    '13.2.1',
    '13.2.0',
    '13.1.0',
    '13.0.3',
    '13.0.2',
    '13.0.1',
    '13.0.0',
    '12.9.1',
    '12.9.0',
    '12.8.1',
    '12.8.0',
    '12.7.0',
    '12.6.2',
  ] as const,
  aliases: [] as const,
}

export type GooglecomfirebasetoolsPackage = typeof googlecomfirebasetoolsPackage
