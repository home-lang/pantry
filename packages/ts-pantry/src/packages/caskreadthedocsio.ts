/**
 * **cask** - Project management tool for Emacs
 *
 * @domain `cask.readthedocs.io`
 * @programs `cask`
 * @version `0.9.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cask.readthedocs.io`
 * @homepage https://cask.readthedocs.io/
 * @dependencies `gnu.org/coreutils`, `gnu.org/emacs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.caskreadthedocsio
 * console.log(pkg.name)        // "cask"
 * console.log(pkg.description) // "Project management tool for Emacs"
 * console.log(pkg.programs)    // ["cask"]
 * console.log(pkg.versions[0]) // "0.9.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/cask-readthedocs-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const caskreadthedocsioPackage = {
  /**
  * The display name of this package.
  */
  name: 'cask' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cask.readthedocs.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Project management tool for Emacs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cask.readthedocs.io/package.yml' as const,
  homepageUrl: 'https://cask.readthedocs.io/' as const,
  githubUrl: 'https://github.com/cask/cask' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install cask.readthedocs.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cask.readthedocs.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cask.readthedocs.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cask',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/coreutils',
    'gnu.org/emacs',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.1',
    '0.9.0',
    '0.8.8',
    '0.8.7',
    '0.8.6',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.2',
  ] as const,
  aliases: [] as const,
}

export type CaskreadthedocsioPackage = typeof caskreadthedocsioPackage
