/**
 * **java** - Development kit for the Java programming language
 *
 * @domain `openjdk.org`
 * @programs `jar`, `jarsigner`, `java`, `javac`, `javadoc`, ... (+22 more)
 * @version `21.0.8.7` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install openjdk.org`
 * @aliases `java`, `jdk`
 * @homepage https://openjdk.java.net/
 * @dependencies Linux runtime libraries; macOS JDK artifacts bundle their native libraries.
 * @buildDependencies None: the recipe repackages upstream JDK binaries.
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
 * console.log(pkg.versions[0]) // "21.0.8.7" (latest)
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
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  // The macOS JDK includes its own native libraries. Keep Linux runtime
  // dependencies platform-scoped so they do not block a macOS install.
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
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
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
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'java',
    'jdk',
  ] as const,
}

export type JavaPackage = typeof javaPackage
