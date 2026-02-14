/**
 * **clisp** - GNU CLISP, a Common Lisp implementation
 *
 * @domain `clisp.org`
 * @programs `clisp`
 * @version `2.49.92` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install clisp.org`
 * @homepage https://clisp.sourceforge.io/
 * @dependencies `gnu.org/libsigsegv^2.14`, `gnu.org/readline^8.2`, `github.com/besser82/libxcrypt^4.4`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.clisporg
 * console.log(pkg.name)        // "clisp"
 * console.log(pkg.description) // "GNU CLISP, a Common Lisp implementation"
 * console.log(pkg.programs)    // ["clisp"]
 * console.log(pkg.versions[0]) // "2.49.92" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/clisp-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const clisporgPackage = {
  /**
  * The display name of this package.
  */
  name: 'clisp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'clisp.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU CLISP, a Common Lisp implementation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/clisp.org/package.yml' as const,
  homepageUrl: 'https://clisp.sourceforge.io/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install clisp.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +clisp.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install clisp.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'clisp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/libsigsegv^2.14',
    'gnu.org/readline^8.2',
    'github.com/besser82/libxcrypt^4.4',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.49.92',
  ] as const,
  aliases: [] as const,
}

export type ClisporgPackage = typeof clisporgPackage
