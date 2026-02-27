/**
 * **eas** - Fastest way to build, submit, and update iOS and Android apps
 *
 * @domain `expo.dev/eas-cli`
 * @programs `eas`
 * @version `18.0.6` (178 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install expo.dev/eas-cli`
 * @homepage https://docs.expo.dev/eas/
 * @dependencies `nodejs.org^18.18 || >=20`
 * @buildDependencies `python.org@~3.10`, `classic.yarnpkg.com`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.expodeveascli
 * console.log(pkg.name)        // "eas"
 * console.log(pkg.description) // "Fastest way to build, submit, and update iOS an..."
 * console.log(pkg.programs)    // ["eas"]
 * console.log(pkg.versions[0]) // "18.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/expo-dev/eas-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const expodeveascliPackage = {
  /**
  * The display name of this package.
  */
  name: 'eas' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'expo.dev/eas-cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fastest way to build, submit, and update iOS and Android apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/expo.dev/eas-cli/package.yml' as const,
  homepageUrl: 'https://docs.expo.dev/eas/' as const,
  githubUrl: 'https://github.com/expo/eas-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install expo.dev/eas-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +expo.dev/eas-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install expo.dev/eas-cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'eas',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^18.18 || >=20',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'python.org@~3.10',
    'classic.yarnpkg.com',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '18.0.6',
    '18.0.5',
    '18.0.4',
    '18.0.3',
    '18.0.1',
    '16.32.0',
    '16.28.0',
    '16.27.0',
    '16.26.0',
    '16.25.1',
    '16.25.0',
    '16.24.1',
    '16.24.0',
    '16.23.1',
    '16.23.0',
    '16.22.0',
    '16.21.0',
    '16.20.4',
    '16.20.3',
    '16.20.2',
    '16.20.1',
    '16.20.0',
    '16.19.3',
    '16.19.2',
    '16.19.1',
    '16.19.0',
    '16.18.1',
    '16.18.0',
    '16.17.4',
    '16.17.3',
    '16.17.2',
    '16.17.1',
    '16.17.0',
    '16.16.0',
    '16.15.0',
    '16.14.1',
    '16.14.0',
    '16.13.4',
    '16.13.3',
    '16.13.2',
    '16.13.1',
    '16.13.0',
    '16.12.0',
    '16.11.0',
    '16.10.1',
    '16.10.0',
    '16.9.0',
    '16.8.0',
    '16.7.2',
    '16.7.1',
    '16.7.0',
    '16.6.2',
    '16.6.1',
    '16.6.0',
    '16.5.0',
    '16.4.2',
    '16.4.1',
    '16.4.0',
    '16.3.3',
    '16.3.2',
    '16.3.1',
    '16.3.0',
    '16.2.2',
    '16.2.1',
    '16.2.0',
    '16.1.0',
    '16.0.1',
    '16.0.0',
    '15.0.15',
    '15.0.14',
    '15.0.13',
    '15.0.12',
    '15.0.11',
    '15.0.10',
    '15.0.9',
    '15.0.8',
    '15.0.7',
    '15.0.6',
    '15.0.5',
    '15.0.4',
    '15.0.3',
    '15.0.2',
    '15.0.1',
    '15.0.0',
    '14.7.1',
    '14.7.0',
    '14.6.0',
    '14.5.0',
    '14.4.1',
    '14.4.0',
    '14.3.1',
    '14.3.0',
    '14.2.0',
    '14.1.0',
    '14.0.3',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.4.2',
    '13.4.1',
    '13.4.0',
    '13.3.0',
    '13.2.3',
    '13.2.2',
    '13.2.1',
    '13.2.0',
    '13.1.1',
    '13.1.0',
    '13.0.1',
    '13.0.0',
    '12.6.2',
    '12.6.1',
    '12.6.0',
    '12.5.4',
    '12.5.3',
    '12.5.2',
    '12.5.1',
    '12.5.0',
    '12.4.1',
    '12.4.0',
    '12.3.0',
    '12.2.0',
    '12.1.1',
    '12.1.0',
    '12.0.0',
    '11.0.3',
    '11.0.2',
    '11.0.1',
    '11.0.0',
    '10.2.4',
    '10.2.3',
    '10.2.2',
    '10.2.1',
    '10.2.0',
    '10.1.1',
    '10.1.0',
    '10.0.3',
    '10.0.2',
    '10.0.1',
    '10.0.0',
    '9.2.0',
    '9.1.0',
    '9.0.10',
    '9.0.9',
    '9.0.8',
    '9.0.7',
    '9.0.6',
    '9.0.5',
    '9.0.4',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.0.0',
    '7.8.5',
    '7.8.4',
    '7.8.3',
    '7.8.2',
    '7.8.1',
    '7.8.0',
    '7.7.0',
    '7.6.2',
    '7.6.1',
    '7.6.0',
    '7.5.0',
    '7.4.0',
    '7.3.0',
    '7.2.0',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.0',
    '6.1.0',
    '6.0.0',
    '5.9.3',
    '5.9.2',
    '5.9.1',
  ] as const,
  aliases: [] as const,
}

export type ExpodeveascliPackage = typeof expodeveascliPackage
