/**
 * **markupsafe.palletsprojects** - Safely add untrusted strings to HTML/XML markup.
 *
 * @domain `markupsafe.palletsprojects.com`
 * @version `3.0.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install markupsafe.palletsprojects.com`
 * @homepage https://markupsafe.palletsprojects.com
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.markupsafepalletsprojectscom
 * console.log(pkg.name)        // "markupsafe.palletsprojects"
 * console.log(pkg.description) // "Safely add untrusted strings to HTML/XML markup."
 * console.log(pkg.versions[0]) // "3.0.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/markupsafe-palletsprojects-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const markupsafepalletsprojectscomPackage = {
  /**
  * The display name of this package.
  */
  name: 'markupsafe.palletsprojects' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'markupsafe.palletsprojects.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Safely add untrusted strings to HTML/XML markup.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/markupsafe.palletsprojects.com/package.yml' as const,
  homepageUrl: 'https://markupsafe.palletsprojects.com' as const,
  githubUrl: 'https://github.com/pallets/markupsafe' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install markupsafe.palletsprojects.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +markupsafe.palletsprojects.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install markupsafe.palletsprojects.com' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type MarkupsafepalletsprojectscomPackage = typeof markupsafepalletsprojectscomPackage
