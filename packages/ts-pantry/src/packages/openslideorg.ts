/**
 * **openslide** - C library to read whole-slide images (a.k.a. virtual slides)
 *
 * @domain `openslide.org`
 * @programs `openslide-quickhash1sum`, `openslide-show-properties`, `openslide-write-png`
 * @version `4.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install openslide.org`
 * @homepage https://openslide.org/
 * @dependencies `cairographics.org`, `gnome.org/gdk-pixbuf`, `gnome.org/glib`, ... (+6 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.openslideorg
 * console.log(pkg.name)        // "openslide"
 * console.log(pkg.description) // "C library to read whole-slide images (a.k.a. vi..."
 * console.log(pkg.programs)    // ["openslide-quickhash1sum", "openslide-show-properties", ...]
 * console.log(pkg.versions[0]) // "4.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/openslide-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const openslideorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'openslide' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'openslide.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C library to read whole-slide images (a.k.a. virtual slides)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openslide.org/package.yml' as const,
  homepageUrl: 'https://openslide.org/' as const,
  githubUrl: 'https://github.com/openslide/openslide' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install openslide.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openslide.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install openslide.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'openslide-quickhash1sum',
    'openslide-show-properties',
    'openslide-write-png',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'cairographics.org',
    'gnome.org/gdk-pixbuf',
    'gnome.org/glib',
    'libjpeg-turbo.org',
    'libpng.org',
    'simplesystems.org/libtiff',
    'gnome.org/libxml2',
    'openjpeg.org',
    'sqlite.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.0',
    '3.4.1',
  ] as const,
  aliases: [] as const,
}

export type OpenslideorgPackage = typeof openslideorgPackage
