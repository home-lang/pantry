/**
 * **openjdk** - Development kit for the Java programming language
 *
 * @domain `openjdk.org`
 * @programs `jar`, `jarsigner`, `java`, `javac`, `javadoc`, ... (+22 more)
 * @version `21.0.8.7` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openjdk.org`
 * @homepage https://openjdk.java.net/
 * @dependencies `giflib.sourceforge.io`, `harfbuzz.org^8`, `libjpeg-turbo.org`, ... (+17 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:llvm.org@^16`, `linux:gnu.org/make`, `gnu.org/autoconf`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openjdkorg
 * console.log(pkg.name)        // "openjdk"
 * console.log(pkg.description) // "Development kit for the Java programming language"
 * console.log(pkg.programs)    // ["jar", "jarsigner", ...]
 * console.log(pkg.versions[0]) // "21.0.8.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openjdk-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openjdkorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'openjdk' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openjdk.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Development kit for the Java programming language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openjdk.org/package.yml' as const,
  homepageUrl: 'https://openjdk.java.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openjdk.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openjdk.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openjdk.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jar',
    'jarsigner',
    'java',
    'javac',
    'javadoc',
    'javap',
    'jcmd',
    'jconsole',
    'jdb',
    'jdeprscan',
    'jdeps',
    'jfr',
    'jhsdb',
    'jimage',
    'jinfo',
    'jlink',
    'jmap',
    'jmod',
    'jps',
    'jrunscript',
    'jshell',
    'jstack',
    'jstat',
    'jstatd',
    'keytool',
    'rmiregistry',
    'serialver',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'giflib.sourceforge.io',
    'harfbuzz.org^8',
    'libjpeg-turbo.org',
    'libpng.org',
    'littlecms.com',
    'openprinting.github.io/cups',
    'info-zip.org/unzip',
    'zlib.net',
    'libzip.org',
    'linux:alsa-project.org/alsa-lib',
    'linux:freedesktop.org/fontconfig',
    'linux:freetype.org',
    'linux:x.org/x11',
    'linux:x.org/exts',
    'linux:x.org/xrandr',
    'linux:x.org/xrender',
    'linux:x.org/xt',
    'linux:x.org/xtst',
    'linux:info-zip.org/zip',
    'linux:darwinsys.com/file',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:llvm.org@^16',
    'linux:gnu.org/make',
    'gnu.org/autoconf',
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '21.0.8.7',
    '21.0.7.4',
    '21.0.6.6',
    '21.0.3.6',
    '17.0.16.7',
    '17.0.11.4',
    '17.0.10.6',
    '11.0.28.5',
    '11.0.23.6',
  ] as const,
  aliases: [] as const,
}

export type OpenjdkorgPackage = typeof openjdkorgPackage
