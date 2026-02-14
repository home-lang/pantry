/**
 * **typst** - A new markup-based typesetting system that is powerful and easy to learn.
 *
 * @domain `typst.app`
 * @programs `typst`
 * @version `0.14.2` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install typst.app`
 * @homepage https://typst.app/
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.typstapp
 * console.log(pkg.name)        // "typst"
 * console.log(pkg.description) // "A new markup-based typesetting system that is p..."
 * console.log(pkg.programs)    // ["typst"]
 * console.log(pkg.versions[0]) // "0.14.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/typst-app.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const typstappPackage = {
  /**
  * The display name of this package.
  */
  name: 'typst' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'typst.app' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A new markup-based typesetting system that is powerful and easy to learn.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/typst.app/package.yml' as const,
  homepageUrl: 'https://typst.app/' as const,
  githubUrl: 'https://github.com/typst/typst' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install typst.app' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +typst.app -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install typst.app' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'typst',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.0',
    '0.2.0',
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type TypstappPackage = typeof typstappPackage
