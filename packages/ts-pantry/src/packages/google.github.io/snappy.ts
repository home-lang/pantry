/**
 * **snappy** - A fast compressor/decompressor
 *
 * @domain `google.github.io/snappy`
 * @version `1.2.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.github.io/snappy`
 * @buildDependencies `cmake.org`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlegithubiosnappy
 * console.log(pkg.name)        // "snappy"
 * console.log(pkg.description) // "A fast compressor/decompressor"
 * console.log(pkg.versions[0]) // "1.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-github-io/snappy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlegithubiosnappyPackage = {
  /**
  * The display name of this package.
  */
  name: 'snappy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.github.io/snappy' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A fast compressor/decompressor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.github.io/snappy/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/snappy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install google.github.io/snappy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.github.io/snappy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.github.io/snappy' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.10',
  ] as const,
  aliases: [] as const,
}

export type GooglegithubiosnappyPackage = typeof googlegithubiosnappyPackage
