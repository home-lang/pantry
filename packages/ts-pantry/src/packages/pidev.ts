/**
 * **pi** - pkgx package
 *
 * @domain `pi.dev`
 * @programs `pi`, `pi-init`
 * @version `0.61.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pi.dev`
 * @dependencies `nodejs.org^20`, `github.com/mikefarah/yq`, `stedolan.github.io/jq`, ... (+1 more)
 * @buildDependencies `nodejs.org@^20`, `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pidev
 * console.log(pkg.name)        // "pi"
 * console.log(pkg.programs)    // ["pi", "pi-init"]
 * console.log(pkg.versions[0]) // "0.61.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pi-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const pidevPackage = {
  /**
  * The display name of this package.
  */
  name: 'pi' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pi.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pi.dev/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pi.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pi.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pi.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pi',
    'pi-init',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20',
    'github.com/mikefarah/yq',
    'stedolan.github.io/jq',
    'gnu.org/sed',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'nodejs.org@^20',
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.4',
    '0.58.3',
    '0.58.2',
    '0.58.1',
    '0.58.0',
    '0.57.1',
    '0.57.0',
    '0.56.3',
    '0.56.2',
    '0.56.1',
    '0.56.0',
    '0.55.4',
    '0.55.3',
    '0.55.2',
    '0.55.1',
  ] as const,
  aliases: [] as const,
}

export type PidevPackage = typeof pidevPackage
