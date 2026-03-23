/**
 * **cruft** - Allows you to maintain all the necessary cruft for packaging and building projects separate from the code you intentionally write. Built on-top of, and fully compatible with, CookieCutter.
 *
 * @domain `cruft.github.io`
 * @programs `cruft`
 * @version `2.16.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cruft.github.io`
 * @homepage https://cruft.github.io/cruft/
 * @dependencies `python.org>=3.7<3.12`, `git-scm.org^2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cruftgithubio
 * console.log(pkg.name)        // "cruft"
 * console.log(pkg.description) // "Allows you to maintain all the necessary cruft ..."
 * console.log(pkg.programs)    // ["cruft"]
 * console.log(pkg.versions[0]) // "2.16.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/cruft-github-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cruftgithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'cruft' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cruft.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Allows you to maintain all the necessary cruft for packaging and building projects separate from the code you intentionally write. Built on-top of, and fully compatible with, CookieCutter.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cruft.github.io/package.yml' as const,
  homepageUrl: 'https://cruft.github.io/cruft/' as const,
  githubUrl: 'https://github.com/cruft/cruft' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install cruft.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cruft.github.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cruft.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cruft',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3.7<3.12',
    'git-scm.org^2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.16.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type CruftgithubioPackage = typeof cruftgithubioPackage
