/**
 * **jadx** - Dex to Java decompiler
 *
 * @domain `github.com/skylot/jadx`
 * @programs `jadx`, `jadx-gui`
 * @version `1.5.4` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/skylot/jadx`
 * @dependencies `openjdk.org^21`
 * @buildDependencies `gradle.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomskylotjadx
 * console.log(pkg.name)        // "jadx"
 * console.log(pkg.description) // "Dex to Java decompiler"
 * console.log(pkg.programs)    // ["jadx", "jadx-gui"]
 * console.log(pkg.versions[0]) // "1.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/skylot/jadx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jadxPackage = {
  /**
  * The display name of this package.
  */
  name: 'jadx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/skylot/jadx' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Dex to Java decompiler' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/skylot/jadx/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/skylot/jadx' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/skylot/jadx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/skylot/jadx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/skylot/jadx' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jadx',
    'jadx-gui',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org^21',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gradle.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.7',
  ] as const,
  aliases: [] as const,
}

export type JadxPackage = typeof jadxPackage
