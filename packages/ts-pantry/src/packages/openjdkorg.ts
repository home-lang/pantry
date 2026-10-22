/**
 * **java** - Development kit for the Java programming language
 *
 * @domain `openjdk.org`
 * @programs `jar`, `jarsigner`, `java`, `javac`, `javadoc`, ... (+22 more)
 * @version `27.0.0.35` (128 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install openjdk.org`
 * @aliases `java`, `jdk`
 * @homepage https://openjdk.java.net/
 * @dependencies `linux:giflib.sourceforge.io`, `linux:harfbuzz.org^8`, `linux:libjpeg-turbo.org`, ... (+17 more) (includes platform-specific dependencies)
 * @buildDependencies `curl.se`, `gnu.org/coreutils`, `gnu.org/tar` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.java
 * // Or access via domain
 * const samePkg = pantry.openjdkorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "openjdk"
 * console.log(pkg.description) // "Development kit for the Java programming language"
 * console.log(pkg.programs)    // ["jar", "jarsigner", ...]
 * console.log(pkg.versions[0]) // "27.0.0.35" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/openjdk-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const javaPackage = {
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install openjdk.org' as const,
  pantryInstallCommand: 'pantry install openjdk.org' as const,
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
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:giflib.sourceforge.io',
    'linux:harfbuzz.org^8',
    'linux:libjpeg-turbo.org',
    'linux:libpng.org',
    'linux:littlecms.com',
    'linux:openprinting.github.io/cups',
    'linux:info-zip.org/unzip',
    'linux:zlib.net',
    'linux:libzip.org',
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
  */
  buildDependencies: [
    'curl.se',
    'gnu.org/coreutils',
    'gnu.org/tar',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '27.0.0.35',
    '26.0.2.10',
    '26.0.2.1.1',
    '26.0.1.8',
    '26.0.0.35',
    '25.0.5.8',
    '25.0.4.7',
    '25.0.4.1.1',
    '25.0.3.9',
    '25.0.2.10',
    '25.0.1.8',
    '25.0.0.36',
    '24.0.2.12',
    '24.0.1.9',
    '24.0.0.36',
    '23.0.2.7',
    '23.0.1.11',
    '23.0.0.37',
    '22.0.2.9',
    '22.0.1.8',
    '22.0.1.1.1',
    '22.0.0.36',
    '21.0.12.8',
    '21.0.12.1.1',
    '21.0.11.10',
    '21.0.10.7',
    '21.0.9.10',
    '21.0.8.9',
    '21.0.8.7',
    '21.0.7.6',
    '21.0.7.4',
    '21.0.6.7',
    '21.0.6.6',
    '21.0.5.11',
    '21.0.4.7',
    '21.0.3.9',
    '21.0.3.6',
    '21.0.2.13',
    '21.0.1.12',
    '21.0.0.35',
    '20.0.2.9',
    '20.0.1.9',
    '20.0.0.36',
    '19.0.2.7',
    '19.0.1.10',
    '19.0.0.36',
    '18.0.2.9',
    '18.0.2.1.1',
    '18.0.1.10',
    '18.0.0.36',
    '17.0.20.8',
    '17.0.20.1.1',
    '17.0.19.10',
    '17.0.18.8',
    '17.0.17.10',
    '17.0.16.8',
    '17.0.16.7',
    '17.0.15.6',
    '17.0.14.7',
    '17.0.13.11',
    '17.0.12.7',
    '17.0.11.9',
    '17.0.11.4',
    '17.0.10.7',
    '17.0.10.6',
    '17.0.9.9',
    '17.0.8.7',
    '17.0.8.1.1',
    '17.0.7.7',
    '17.0.6.10',
    '17.0.5.8',
    '17.0.4.8',
    '17.0.4.1.1',
    '17.0.3.7',
    '17.0.2.8',
    '17.0.1.12',
    '17.0.0.35',
    '16.0.2.7',
    '11.0.32.9',
    '11.0.32.1.1',
    '11.0.31.11',
    '11.0.30.7',
    '11.0.29.7',
    '11.0.28.6',
    '11.0.28.5',
    '11.0.27.6',
    '11.0.26.4',
    '11.0.25.9',
    '11.0.24.8',
    '11.0.23.9',
    '11.0.23.6',
    '11.0.22.7',
    '11.0.21.9',
    '11.0.20.8',
    '11.0.20.1.1',
    '11.0.19.7',
    '11.0.18.10',
    '11.0.17.8',
    '11.0.16.8',
    '11.0.16.1.1',
    '11.0.15.10',
    '11.0.14.9',
    '11.0.14.1.1',
    '11.0.13.8',
    '11.0.12.7',
    '8.0.504.1',
    '8.0.502.7',
    '8.0.492.9',
    '8.0.482.8',
    '8.0.472.8',
    '8.0.462.8',
    '8.0.452.9',
    '8.0.442.6',
    '8.0.432.6',
    '8.0.422.5',
    '8.0.412.8',
    '8.0.402.6',
    '8.0.392.8',
    '8.0.382.5',
    '8.0.372.7',
    '8.0.362.9',
    '8.0.352.8',
    '8.0.345.1',
    '8.0.342.7',
    '8.0.332.9',
    '8.0.322.6',
    '8.0.312.7',
    '8.0.302.8',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'java',
    'jdk',
  ] as const,
  programVersions: {
  jrunscript: {
  before: 26 as const,
},
},
}

export type JavaPackage = typeof javaPackage
