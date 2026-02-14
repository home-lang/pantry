/**
 * **GPT Engineer** - Platform to experiment with the AI Software Engineer. Terminal based. NOTE: Very different from https://gptengineer.app
 *
 * @domain `github.com/AntonOsika/gpt-engineer`
 * @programs `gpte`, `gpt-engineer`
 * @version `0.3.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/AntonOsika/gpt-engineer`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomantonosikagptengineer
 * console.log(pkg.name)        // "GPT Engineer"
 * console.log(pkg.description) // "Platform to experiment with the AI Software Eng..."
 * console.log(pkg.programs)    // ["gpte", "gpt-engineer"]
 * console.log(pkg.versions[0]) // "0.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/AntonOsika/gpt-engineer.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gptengineerPackage = {
  /**
  * The display name of this package.
  */
  name: 'GPT Engineer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/AntonOsika/gpt-engineer' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Platform to experiment with the AI Software Engineer. Terminal based. NOTE: Very different from https://gptengineer.app' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AntonOsika/gpt-engineer/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/AntonOsika/gpt-engineer' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/AntonOsika/gpt-engineer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/AntonOsika/gpt-engineer -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/AntonOsika/gpt-engineer' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gpte',
    'gpt-engineer',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.1',
    '0.3.0',
    '0.2.9',
    '0.2.7',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.1',
    '0.0.9',
    '0.0.8',
    '0.0.7',
    '0.0.6',
    '0.0.5',
    '0.0.4',
    '0.0.3',
  ] as const,
  aliases: [] as const,
}

export type GptengineerPackage = typeof gptengineerPackage
