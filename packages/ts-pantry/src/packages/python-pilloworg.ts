/**
 * **python-pillow** - Python Imaging Library (Fork)
 *
 * @domain `python-pillow.org`
 * @version `12.1.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install python-pillow.org`
 * @homepage https://python-pillow.github.io
 * @dependencies `libjpeg-turbo.org^2`, `pngquant.org/lib^4`, `simplesystems.org/libtiff^4`, ... (+7 more)
 * @buildDependencies `pypa.io/setuptools` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pythonpilloworg
 * console.log(pkg.name)        // "python-pillow"
 * console.log(pkg.description) // "Python Imaging Library (Fork)"
 * console.log(pkg.versions[0]) // "12.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/python-pillow-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythonpilloworgPackage = {
  /**
   * The display name of this package.
   */
  name: 'python-pillow' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'python-pillow.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python Imaging Library (Fork)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/python-pillow.org/package.yml' as const,
  homepageUrl: 'https://python-pillow.github.io' as const,
  githubUrl: 'https://github.com/python-pillow/Pillow' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install python-pillow.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +python-pillow.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install python-pillow.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libjpeg-turbo.org^2',
    'pngquant.org/lib^4',
    'simplesystems.org/libtiff^4',
    'x.org/xcb^1',
    'littlecms.com^2',
    'openjpeg.org^2',
    'tcl.tk/tcl^8',
    'google.com/webp^1',
    'zlib.net^1',
    'python.org~3.12',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'pypa.io/setuptools',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '12.1.0',
    '12.0.0',
    '11.3.0',
    '11.2.1',
    '11.1.0',
    '11.0.0',
    '10.4.0',
    '10.3.0',
    '10.2.0',
  ] as const,
  aliases: [] as const,
}

export type PythonpilloworgPackage = typeof pythonpilloworgPackage
