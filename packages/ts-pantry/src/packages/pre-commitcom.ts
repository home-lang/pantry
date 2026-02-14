/**
 * **pre-commit** - A framework for managing and maintaining multi-language pre-commit hooks.
 *
 * @domain `pre-commit.com`
 * @programs `pre-commit`
 * @version `4.5.1` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pre-commit.com`
 * @homepage https://pre-commit.com/
 * @dependencies `python.org>=3.8<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.precommitcom
 * console.log(pkg.name)        // "pre-commit"
 * console.log(pkg.description) // "A framework for managing and maintaining multi-..."
 * console.log(pkg.programs)    // ["pre-commit"]
 * console.log(pkg.versions[0]) // "4.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pre-commit-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const precommitcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'pre-commit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pre-commit.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A framework for managing and maintaining multi-language pre-commit hooks.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pre-commit.com/package.yml' as const,
  homepageUrl: 'https://pre-commit.com/' as const,
  githubUrl: 'https://github.com/pre-commit/pre-commit' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pre-commit.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pre-commit.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pre-commit.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pre-commit',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3.8<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.5.1',
    '4.5.0',
    '4.4.0',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.1',
    '4.0.0',
    '3.8.0',
    '3.7.1',
    '3.7.0',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.0',
    '3.4.0',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.1',
    '3.1.0',
    '3.0.4',
  ] as const,
  aliases: [] as const,
}

export type PrecommitcomPackage = typeof precommitcomPackage
