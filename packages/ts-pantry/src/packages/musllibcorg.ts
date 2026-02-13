/**
 * **musl.libc** - pkgx package
 *
 * @domain `musl.libc.org`
 * @programs `ld.musl-clang`, `musl-clang`
 * @version `1.2.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install musl.libc.org`
 * @dependencies `llvm.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.musllibcorg
 * console.log(pkg.name)        // "musl.libc"
 * console.log(pkg.programs)    // ["ld.musl-clang", "musl-clang"]
 * console.log(pkg.versions[0]) // "1.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/musl-libc-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const musllibcorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'musl.libc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'musl.libc.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/musl.libc.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install musl.libc.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +musl.libc.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install musl.libc.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ld.musl-clang',
    'musl-clang',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'llvm.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.3',
  ] as const,
  aliases: [] as const,
}

export type MusllibcorgPackage = typeof musllibcorgPackage
