/**
 * **sndfile** - A C library for reading and writing sound files containing sampled audio data.
 *
 * @domain `github.com/libsndfile/libsndfile`
 * @programs `sndfile-info`, `sndfile-convert`, `sndfile-play`
 * @version `1.2.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libsndfile/libsndfile`
 * @homepage https://libsndfile.github.io/libsndfile/
 * @dependencies `xiph.org/flac`, `lame.sourceforge.io`, `xiph.org/ogg`, ... (+3 more)
 * @buildDependencies `cmake.org`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibsndfilelibsndfile
 * console.log(pkg.name)        // "sndfile"
 * console.log(pkg.description) // "A C library for reading and writing sound files..."
 * console.log(pkg.programs)    // ["sndfile-info", "sndfile-convert", ...]
 * console.log(pkg.versions[0]) // "1.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libsndfile/libsndfile.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsndfilePackage = {
  /**
  * The display name of this package.
  */
  name: 'sndfile' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/libsndfile/libsndfile' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A C library for reading and writing sound files containing sampled audio data.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libsndfile/libsndfile/package.yml' as const,
  homepageUrl: 'https://libsndfile.github.io/libsndfile/' as const,
  githubUrl: 'https://github.com/libsndfile/libsndfile' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/libsndfile/libsndfile' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libsndfile/libsndfile -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libsndfile/libsndfile' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sndfile-info',
    'sndfile-convert',
    'sndfile-play',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'xiph.org/flac',
    'lame.sourceforge.io',
    'xiph.org/ogg',
    'xiph.org/vorbis',
    'mpg123.de',
    'opus-codec.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.2',
    '1.2.1',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type LibsndfilePackage = typeof libsndfilePackage
