/**
 * **libsixel** - Mirror of "sixel" original version (kmiya's sixel). The origin of libsixel.
 *
 * @domain `github.com/libsixel/libsixel`
 * @programs `img2sixel`, `sixel2png`, `libsixel-config`
 * @version `1.10.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libsixel/libsixel`
 * @homepage http://nanno.dip.jp/softlib/man/rlogin/#REGWIND
 * @dependencies `libjpeg-turbo.org`, `libpng.org`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibsixellibsixel
 * console.log(pkg.name)        // "libsixel"
 * console.log(pkg.description) // "Mirror of "sixel" original version (kmiya's six..."
 * console.log(pkg.programs)    // ["img2sixel", "sixel2png", ...]
 * console.log(pkg.versions[0]) // "1.10.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libsixel/libsixel.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsixelPackage = {
  /**
  * The display name of this package.
  */
  name: 'libsixel' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/libsixel/libsixel' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Mirror of "sixel" original version (kmiya\'s sixel). The origin of libsixel.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libsixel/libsixel/package.yml' as const,
  homepageUrl: 'http://nanno.dip.jp/softlib/man/rlogin/#REGWIND' as const,
  githubUrl: 'https://github.com/saitoha/sixel' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/libsixel/libsixel' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libsixel/libsixel -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libsixel/libsixel' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'img2sixel',
    'sixel2png',
    'libsixel-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libjpeg-turbo.org',
    'libpng.org',
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.10.3',
  ] as const,
  aliases: [] as const,
}

export type LibsixelPackage = typeof libsixelPackage
