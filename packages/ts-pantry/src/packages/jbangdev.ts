/**
 * **jbang** - Unleash the power of Java - JBang Lets Students, Educators and Professional Developers create, edit and run self-contained source-only Java programs with unprecedented ease.
 *
 * @domain `jbang.dev`
 * @programs `jbang`
 * @version `0.137.0` (41 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install jbang.dev`
 * @homepage https://jbang.dev/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.jbangdev
 * console.log(pkg.name)        // "jbang"
 * console.log(pkg.description) // "Unleash the power of Java - JBang Lets Students..."
 * console.log(pkg.programs)    // ["jbang"]
 * console.log(pkg.versions[0]) // "0.137.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/jbang-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const jbangdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'jbang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jbang.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Unleash the power of Java - JBang Lets Students, Educators and Professional Developers create, edit and run self-contained source-only Java programs with unprecedented ease.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jbang.dev/package.yml' as const,
  homepageUrl: 'https://jbang.dev/' as const,
  githubUrl: 'https://github.com/jbangdev/jbang' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install jbang.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jbang.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install jbang.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jbang',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.137.0',
    '0.136.0',
    '0.135.1',
    '0.135.0',
    '0.134.3',
    '0.134.2',
    '0.132.1',
    '0.132.0',
    '0.131.0',
    '0.130.0',
    '0.129.0',
    '0.128.7',
    '0.128.6',
    '0.128.5',
    '0.128.2',
    '0.128.1',
    '0.128.0',
    '0.127.18',
    '0.127.15',
    '0.126.3',
  ] as const,
  aliases: [] as const,
}

export type JbangdevPackage = typeof jbangdevPackage
