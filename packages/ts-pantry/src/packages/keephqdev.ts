/**
 * **keep** - The open-source AIOps and alert management platform
 *
 * @domain `keephq.dev`
 * @programs `keep`
 * @version `0.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install keephq.dev`
 * @homepage https://keephq.dev
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.keephqdev
 * console.log(pkg.name)        // "keep"
 * console.log(pkg.description) // "The open-source AIOps and alert management plat..."
 * console.log(pkg.programs)    // ["keep"]
 * console.log(pkg.versions[0]) // "0.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/keephq-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const keephqdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'keep' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'keephq.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The open-source AIOps and alert management platform' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/keephq.dev/package.yml' as const,
  homepageUrl: 'https://keephq.dev' as const,
  githubUrl: 'https://github.com/keephq/keep' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install keephq.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +keephq.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install keephq.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'keep',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type KeephqdevPackage = typeof keephqdevPackage
