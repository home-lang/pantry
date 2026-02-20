/**
 * **allure** - Allure Report is a flexible, lightweight multi-language test reporting tool. It provides clear graphical reports and allows everyone involved in the development process to extract the maximum of information from the everyday testing process
 *
 * @domain `github.com/allure-framework/allure2`
 * @programs `allure`
 * @version `2.37.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/allure-framework/allure2`
 * @homepage https://allurereport.org/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomallureframeworkallure2
 * console.log(pkg.name)        // "allure"
 * console.log(pkg.description) // "Allure Report is a flexible, lightweight multi-..."
 * console.log(pkg.programs)    // ["allure"]
 * console.log(pkg.versions[0]) // "2.37.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/allure-framework/allure2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const allure2Package = {
  /**
  * The display name of this package.
  */
  name: 'allure' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/allure-framework/allure2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Allure Report is a flexible, lightweight multi-language test reporting tool. It provides clear graphical reports and allows everyone involved in the development process to extract the maximum of information from the everyday testing process' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/allure-framework/allure2/package.yml' as const,
  homepageUrl: 'https://allurereport.org/' as const,
  githubUrl: 'https://github.com/allure-framework/allure2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/allure-framework/allure2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/allure-framework/allure2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/allure-framework/allure2' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'allure',
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.37.0',
    '2.36.0',
    '2.35.1',
    '2.35.0',
    '2.34.1',
    '2.34.0',
    '2.33.0',
    '2.32.2',
    '2.32.0',
    '2.31.0',
    '2.30.0',
    '2.29.0',
    '2.28.0',
    '2.27.0',
    '2.26.0',
  ] as const,
  aliases: [] as const,
}

export type Allure2Package = typeof allure2Package
