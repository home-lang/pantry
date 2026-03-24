/**
 * **git2** - A cross-platform, linkable library implementation of Git that you can use in your application.
 *
 * @domain `libgit2.org`
 * @programs `git2`
 * @version `1.9.2` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install libgit2.org`
 * @homepage https://libgit2.github.com/
 * @dependencies `libssh2.org^1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.libgit2org
 * console.log(pkg.name)        // "git2"
 * console.log(pkg.description) // "A cross-platform, linkable library implementati..."
 * console.log(pkg.programs)    // ["git2"]
 * console.log(pkg.versions[0]) // "1.9.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/libgit2-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install libgit2.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libgit2.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install libgit2.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
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
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.99.0',
    '0.28.5',
    '0.28.4',
    '0.28.3',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.10',
    '0.27.9',
    '0.27.8',
    '0.27.7',
    '0.27.6',
    '0.26.8',
  ] as const,
  aliases: [] as const,
}

export type Libgit2orgPackage = typeof libgit2orgPackage
