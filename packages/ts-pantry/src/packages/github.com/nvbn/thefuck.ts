/**
 * **thefuck** - Magnificent app which corrects your previous console command.
 *
 * @domain `github.com/nvbn/thefuck`
 * @programs `thefuck`
 * @version `3.32.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nvbn/thefuck`
 * @dependencies `python.org~3.11`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnvbnthefuck
 * console.log(pkg.name)        // "thefuck"
 * console.log(pkg.description) // "Magnificent app which corrects your previous co..."
 * console.log(pkg.programs)    // ["thefuck"]
 * console.log(pkg.versions[0]) // "3.32.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nvbn/thefuck.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const thefuckPackage = {
  /**
  * The display name of this package.
  */
  name: 'thefuck' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/nvbn/thefuck' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Magnificent app which corrects your previous console command.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nvbn/thefuck/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nvbn/thefuck' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/nvbn/thefuck' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nvbn/thefuck -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nvbn/thefuck' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'thefuck',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.32.0',
  ] as const,
  aliases: [] as const,
}

export type ThefuckPackage = typeof thefuckPackage
