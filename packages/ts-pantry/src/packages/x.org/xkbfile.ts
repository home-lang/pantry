/**
 * **xkbfile** - pkgx package
 *
 * @domain `x.org/xkbfile`
 * @version `1.2.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install x.org/xkbfile`
 * @dependencies `x.org/x11`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xorgxkbfile
 * console.log(pkg.name)        // "xkbfile"
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/x-org/xkbfile.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const xorgxkbfilePackage = {
  /**
  * The display name of this package.
  */
  name: 'xkbfile' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xkbfile' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xkbfile/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install x.org/xkbfile' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xkbfile -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install x.org/xkbfile' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.0',
    '1.1.3',
    '1.1.2',
  ] as const,
  aliases: [] as const,
}

export type XorgxkbfilePackage = typeof xorgxkbfilePackage
