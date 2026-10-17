/**
 * **webp** - Mirror only. Please do not send pull requests. See https://chromium.googlesource.com/webm/libwebp/+/HEAD/CONTRIBUTING.md.
 *
 * @domain `google.com/webp`
 * @programs `cwebp`, `dwebp`, `gif2webp`, `img2webp`, `vwebp`, ... (+2 more)
 * @version `1.6.0` (67 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install google.com/webp`
 * @homepage https://developers.google.com/speed/webp/
 * @dependencies `giflib.sourceforge.io^5`, `libjpeg-turbo.org^2`, `libpng.org^1`, ... (+2 more) (includes platform-specific dependencies)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.googlecomwebp
 * console.log(pkg.name)        // "webp"
 * console.log(pkg.description) // "Mirror only. Please do not send pull requests. ..."
 * console.log(pkg.programs)    // ["cwebp", "dwebp", ...]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/google-com/webp.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const googlecomwebpPackage = {
  /**
  * The display name of this package.
  */
  name: 'webp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/webp' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Mirror only. Please do not send pull requests. See https://chromium.googlesource.com/webm/libwebp/+/HEAD/CONTRIBUTING.md.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/webp/package.yml' as const,
  homepageUrl: 'https://developers.google.com/speed/webp/' as const,
  githubUrl: 'https://github.com/webmproject/libwebp' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install google.com/webp' as const,
  pantryInstallCommand: 'pantry install google.com/webp' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cwebp',
    'dwebp',
    'gif2webp',
    'img2webp',
    'vwebp',
    'webpinfo',
    'webpmux',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'giflib.sourceforge.io^5',
    'libjpeg-turbo.org^2',
    'libpng.org^1',
    'simplesystems.org/libtiff^4',
    'linux:freeglut.sourceforge.io^3',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.0',
    '1.6.0-rc1',
    '1.5.0',
    '1.5.0-rc1',
    '1.4.0',
    '1.4.0-rc1',
    '1.3.2',
    '1.3.1',
    '1.3.1-rc2',
    '1.3.1-rc1',
    '1.3.0',
    '1.3.0-rc1',
    '1.2.4',
    '1.2.3',
    '1.2.3-rc1',
    '1.2.2',
    '1.2.2-rc2',
    '1.2.2-rc1',
    '1.2.1',
    '1.2.1-rc2',
    '1.2.0',
    '1.2.0-rc3',
    '1.1.0',
    '1.1.0-rc2',
    '1.0.3',
    '1.0.3-rc1',
    '1.0.2',
    '1.0.2-rc1',
    '1.0.1',
    '1.0.1-rc2',
    '1.0.0',
    '1.0.0-rc3',
    '1.0.0-rc2',
    '1.0.0-rc1',
    '0.6.1',
    '0.6.1-rc2',
    '0.6.0',
    '0.6.0-rc3',
    '0.6.0-rc2',
    '0.5.2',
    '0.5.2-rc2',
    '0.5.1',
    '0.5.1-rc5',
    '0.5.0',
    '0.5.0-rc1',
    '0.4.4',
    '0.4.4-rc2',
    '0.4.3',
    '0.4.3-rc1',
    '0.4.2',
    '0.4.2-rc2',
    '0.4.1',
    '0.4.1-rc1',
    '0.4.0',
    '0.4.0-rc1',
    '0.3.1',
    '0.3.1-rc2',
    '0.3.1-rc1',
    '0.3.0',
    '0.3.0-rc7',
    '0.3.0-rc6',
    '0.2.1',
    '0.2.0',
    '0.2.0-rc1',
    '0.1.99',
    '0.1.3',
    '0.1.2',
  ] as const,
  aliases: [] as const,
}

export type GooglecomwebpPackage = typeof googlecomwebpPackage
