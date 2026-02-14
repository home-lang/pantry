/**
 * **pkg** - Package your Node.js project into an executable
 *
 * @domain `vercel.com/pkg`
 * @programs `pkg`
 * @version `5.8.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vercel.com/pkg`
 * @homepage https://npmjs.com/pkg
 * @dependencies `nodejs.org`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vercelcompkg
 * console.log(pkg.name)        // "pkg"
 * console.log(pkg.description) // "Package your Node.js project into an executable"
 * console.log(pkg.programs)    // ["pkg"]
 * console.log(pkg.versions[0]) // "5.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vercel-com/pkg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vercelcompkgPackage = {
  /**
  * The display name of this package.
  */
  name: 'pkg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vercel.com/pkg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Package your Node.js project into an executable' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vercel.com/pkg/package.yml' as const,
  homepageUrl: 'https://npmjs.com/pkg' as const,
  githubUrl: 'https://github.com/vercel/pkg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install vercel.com/pkg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vercel.com/pkg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vercel.com/pkg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pkg',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.8.1',
  ] as const,
  aliases: [] as const,
}

export type VercelcompkgPackage = typeof vercelcompkgPackage
