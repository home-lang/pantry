/**
 * **tectonic** - A modernized, complete, self-contained TeX/LaTeX engine, powered by XeTeX and TeXLive.
 *
 * @domain `tectonic-typesetting.github.io`
 * @programs `tectonic`
 * @version `0.15.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tectonic-typesetting.github.io`
 * @homepage https://tectonic-typesetting.github.io/
 * @dependencies `freetype.org`, `graphite.sil.org`, `harfbuzz.org`, ... (+3 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tectonictypesettinggithubio
 * console.log(pkg.name)        // "tectonic"
 * console.log(pkg.description) // "A modernized, complete, self-contained TeX/LaTe..."
 * console.log(pkg.programs)    // ["tectonic"]
 * console.log(pkg.versions[0]) // "0.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tectonic-typesetting-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tectonictypesettinggithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'tectonic' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tectonic-typesetting.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modernized, complete, self-contained TeX/LaTeX engine, powered by XeTeX and TeXLive.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tectonic-typesetting.github.io/package.yml' as const,
  homepageUrl: 'https://tectonic-typesetting.github.io/' as const,
  githubUrl: 'https://github.com/tectonic-typesetting/tectonic' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tectonic-typesetting.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tectonic-typesetting.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tectonic-typesetting.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tectonic',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'freetype.org',
    'graphite.sil.org',
    'harfbuzz.org',
    'libpng.org',
    'openssl.org^1.1',
    'unicode.org^71',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.0',
  ] as const,
  aliases: [] as const,
}

export type TectonictypesettinggithubioPackage = typeof tectonictypesettinggithubioPackage
