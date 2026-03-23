/**
 * **duk** - Duktape - embeddable Javascript engine with a focus on portability and compact footprint
 *
 * @domain `duktape.org`
 * @programs `duk`
 * @version `2.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install duktape.org`
 * @homepage https://duktape.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.duktapeorg
 * console.log(pkg.name)        // "duk"
 * console.log(pkg.description) // "Duktape - embeddable Javascript engine with a f..."
 * console.log(pkg.programs)    // ["duk"]
 * console.log(pkg.versions[0]) // "2.7.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/duktape-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const duktapeorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'duk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'duktape.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Duktape - embeddable Javascript engine with a focus on portability and compact footprint' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/duktape.org/package.yml' as const,
  homepageUrl: 'https://duktape.org' as const,
  githubUrl: 'https://github.com/svaarala/duktape' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install duktape.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +duktape.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install duktape.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'duk',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.8.0',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.2',
    '1.5.1',
  ] as const,
  aliases: [] as const,
}

export type DuktapeorgPackage = typeof duktapeorgPackage
