/**
 * **git2** - A cross-platform, linkable library implementation of Git that you can use in your application.
 *
 * @domain `libgit2.org`
 * @programs `git2`
 * @version `1.9.2` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libgit2.org`
 * @homepage https://libgit2.github.com/
 * @dependencies `libssh2.org^1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libgit2org
 * console.log(pkg.name)        // "git2"
 * console.log(pkg.description) // "A cross-platform, linkable library implementati..."
 * console.log(pkg.programs)    // ["git2"]
 * console.log(pkg.versions[0]) // "1.9.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libgit2-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libgit2orgPackage = {
  /**
  * The display name of this package.
  */
  name: 'git2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libgit2.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform, linkable library implementation of Git that you can use in your application.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libgit2.org/package.yml' as const,
  homepageUrl: 'https://libgit2.github.com/' as const,
  githubUrl: 'https://github.com/libgit2/libgit2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libgit2.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libgit2.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libgit2.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git2',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libssh2.org^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.5',
    '1.6.4',
  ] as const,
  aliases: [] as const,
}

export type Libgit2orgPackage = typeof libgit2orgPackage
