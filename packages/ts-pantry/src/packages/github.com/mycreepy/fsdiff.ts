/**
 * **fsdiff** - pkgx package
 *
 * @domain `github.com/mycreepy/fsdiff`
 * @version `0.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mycreepy/fsdiff`
 * @buildDependencies `go.dev@^1.26`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommycreepyfsdiff
 * console.log(pkg.name)        // "fsdiff"
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mycreepy/fsdiff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fsdiffPackage = {
  /**
  * The display name of this package.
  */
  name: 'fsdiff' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/mycreepy/fsdiff' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mycreepy/fsdiff/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mycreepy/fsdiff' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/mycreepy/fsdiff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mycreepy/fsdiff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mycreepy/fsdiff' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.26',
    'goreleaser.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type FsdiffPackage = typeof fsdiffPackage
