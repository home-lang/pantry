/**
 * **harfbuzz** - HarfBuzz text shaping engine
 *
 * @domain `harfbuzz.org`
 * @programs `hb-ot-shape-closure`, `hb-shape`, `hb-subset`, `hb-view`
 * @version `999.999.999` (45 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install harfbuzz.org`
 * @homepage http://harfbuzz.github.io/
 * @dependencies `cairographics.org@1`, `freetype.org@2`, `gnome.org/glib@2`, ... (+2 more)
 * @buildDependencies `mesonbuild.com@>=0.63`, `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.harfbuzzorg
 * console.log(pkg.name)        // "harfbuzz"
 * console.log(pkg.description) // "HarfBuzz text shaping engine"
 * console.log(pkg.programs)    // ["hb-ot-shape-closure", "hb-shape", ...]
 * console.log(pkg.versions[0]) // "999.999.999" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/harfbuzz-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const harfbuzzorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'harfbuzz' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'harfbuzz.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'HarfBuzz text shaping engine' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/harfbuzz.org/package.yml' as const,
  homepageUrl: 'http://harfbuzz.github.io/' as const,
  githubUrl: 'https://github.com/harfbuzz/harfbuzz' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install harfbuzz.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +harfbuzz.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install harfbuzz.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hb-ot-shape-closure',
    'hb-shape',
    'hb-subset',
    'hb-view',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'cairographics.org@1',
    'freetype.org@2',
    'gnome.org/glib@2',
    'graphite.sil.org',
    'unicode.org^71',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@>=0.63',
    'python.org@>=3<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '999.999.999',
    '12.3.1',
    '12.3.0',
    '12.2.0',
    '12.1.0',
    '12.0.0',
    '11.5.1',
    '11.5.0',
    '11.4.5',
    '11.4.4',
    '11.4.3',
    '11.4.2',
    '11.4.1',
    '11.3.3',
    '11.3.2',
    '11.3.1',
    '11.3.0',
    '11.2.1',
    '11.2.0',
    '11.1.0',
    '11.0.1',
    '11.0.0',
    '10.4.0',
    '10.3.0',
    '10.2.0',
    '10.1.0',
    '10.0.1',
    '10.0.0',
    '9.0.0',
    '8.5.0',
    '8.4.0',
    '8.3.0',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.1',
    '8.1.0',
    '8.0.1',
    '8.0.0',
    '7.3.0',
    '7.2.0',
    '7.1.0',
    '7.0.1',
    '7.0.0',
    '5.3.1',
  ] as const,
  aliases: [] as const,
}

export type HarfbuzzorgPackage = typeof harfbuzzorgPackage
