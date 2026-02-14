/**
 * **mp** - A CLI tool to make git changes across many repos, especially useful with Microservices.
 *
 * @domain `github.com/clever/microplane`
 * @programs `mp`
 * @version `0.0.37` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/clever/microplane`
 * @homepage https://medium.com/always-a-student/mo-repos-mo-problems-how-we-make-changes-across-many-git-repositories-293ad7d418f0
 * @dependencies `git-scm.org^2`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomclevermicroplane
 * console.log(pkg.name)        // "mp"
 * console.log(pkg.description) // "A CLI tool to make git changes across many repo..."
 * console.log(pkg.programs)    // ["mp"]
 * console.log(pkg.versions[0]) // "0.0.37" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/clever/microplane.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microplanePackage = {
  /**
  * The display name of this package.
  */
  name: 'mp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/clever/microplane' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A CLI tool to make git changes across many repos, especially useful with Microservices.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/clever/microplane/package.yml' as const,
  homepageUrl: 'https://medium.com/always-a-student/mo-repos-mo-problems-how-we-make-changes-across-many-git-repositories-293ad7d418f0' as const,
  githubUrl: 'https://github.com/Clever/microplane' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/clever/microplane' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/clever/microplane -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/clever/microplane' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'git-scm.org^2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.37',
    '0.0.36',
    '0.0.35',
    '0.0.34',
  ] as const,
  aliases: [] as const,
}

export type MicroplanePackage = typeof microplanePackage
