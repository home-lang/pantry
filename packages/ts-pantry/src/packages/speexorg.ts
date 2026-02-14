/**
 * **speexdec** - Audio codec designed for speech
 *
 * @domain `speex.org`
 * @programs `speexdec`
 * @version `1.2.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install speex.org`
 * @homepage https://speex.org/
 * @dependencies `xiph.org/ogg`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.speexorg
 * console.log(pkg.name)        // "speexdec"
 * console.log(pkg.description) // "Audio codec designed for speech"
 * console.log(pkg.programs)    // ["speexdec"]
 * console.log(pkg.versions[0]) // "1.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/speex-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const speexorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'speexdec' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'speex.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Audio codec designed for speech' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/speex.org/package.yml' as const,
  homepageUrl: 'https://speex.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install speex.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +speex.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install speex.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'speexdec',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'xiph.org/ogg',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.1',
  ] as const,
  aliases: [] as const,
}

export type SpeexorgPackage = typeof speexorgPackage
