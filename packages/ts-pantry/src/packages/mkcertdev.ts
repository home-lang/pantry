/**
 * **mkcert** - A simple zero-config tool to make locally trusted development certificates with any names you'd like.
 *
 * @domain `mkcert.dev`
 * @programs `mkcert`
 * @version `1.4.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mkcert.dev`
 * @homepage https://mkcert.dev
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mkcertdev
 * console.log(pkg.name)        // "mkcert"
 * console.log(pkg.description) // "A simple zero-config tool to make locally trust..."
 * console.log(pkg.programs)    // ["mkcert"]
 * console.log(pkg.versions[0]) // "1.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mkcert-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mkcertdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'mkcert' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mkcert.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A simple zero-config tool to make locally trusted development certificates with any names you\'d like.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mkcert.dev/package.yml' as const,
  homepageUrl: 'https://mkcert.dev' as const,
  githubUrl: 'https://github.com/FiloSottile/mkcert' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mkcert.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mkcert.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mkcert.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mkcert',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '1.4.4',
  ] as const,
  aliases: [] as const,
}

export type MkcertdevPackage = typeof mkcertdevPackage
