/**
 * **re2** - RE2 is a fast, safe, thread-friendly alternative to backtracking regular expression engines like those used in PCRE, Perl, and Python. It is a C++ library.
 *
 * @domain `github.com/google/re2`
 * @version `2025.11.5` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/google/re2`
 * @dependencies `abseil.io^20250127`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgooglere2
 * console.log(pkg.name)        // "re2"
 * console.log(pkg.description) // "RE2 is a fast, safe, thread-friendly alternativ..."
 * console.log(pkg.versions[0]) // "2025.11.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/google/re2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const re2Package = {
  /**
  * The display name of this package.
  */
  name: 're2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/google/re2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'RE2 is a fast, safe, thread-friendly alternative to backtracking regular expression engines like those used in PCRE, Perl, and Python. It is a C++ library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/re2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/re2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/google/re2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/google/re2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/google/re2' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'abseil.io^20250127',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2025.11.5',
    '2025.8.12',
    '2025.8.5',
    '2025.7.22',
    '2025.7.17',
    '2025.6.26',
    '2025.06.26b',
    '2024.7.2',
    '2024.7.1',
    '2024.6.1',
    '2023.3.1',
  ] as const,
  aliases: [] as const,
}

export type Re2Package = typeof re2Package
