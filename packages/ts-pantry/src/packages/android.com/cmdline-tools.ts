/**
 * **cmdline-tools** - pkgx package
 *
 * @domain `android.com/cmdline-tools`
 * @programs `apkanalyzer`, `avdmanager`, `lint`, `profgen`, `resourceshrinker`, ... (+3 more)
 * @version `14742923.0.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install android.com/cmdline-tools`
 * @dependencies `openjdk.org>=17`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.androidcomcmdlinetools
 * console.log(pkg.name)        // "cmdline-tools"
 * console.log(pkg.programs)    // ["apkanalyzer", "avdmanager", ...]
 * console.log(pkg.versions[0]) // "14742923.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/android-com/cmdline-tools.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const androidcomcmdlinetoolsPackage = {
  /**
  * The display name of this package.
  */
  name: 'cmdline-tools' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'android.com/cmdline-tools' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/android.com/cmdline-tools/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install android.com/cmdline-tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +android.com/cmdline-tools -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install android.com/cmdline-tools' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'apkanalyzer',
    'avdmanager',
    'lint',
    'profgen',
    'resourceshrinker',
    'retrace',
    'screenshot2',
    'sdkmanager',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org>=17',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '14742923.0.0',
    '13114758.0.0',
    '11076708.0.0',
  ] as const,
  aliases: [] as const,
}

export type AndroidcomcmdlinetoolsPackage = typeof androidcomcmdlinetoolsPackage
