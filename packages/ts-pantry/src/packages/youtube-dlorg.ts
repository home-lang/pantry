/**
 * **youtube-dl** - Command-line program to download videos from YouTube.com and other video sites
 *
 * @domain `youtube-dl.org`
 * @programs `youtube-dl`
 * @version `2023.8.4` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install youtube-dl.org`
 * @homepage https://ytdl-org.github.io/youtube-dl/
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.youtubedlorg
 * console.log(pkg.name)        // "youtube-dl"
 * console.log(pkg.description) // "Command-line program to download videos from Yo..."
 * console.log(pkg.programs)    // ["youtube-dl"]
 * console.log(pkg.versions[0]) // "2023.8.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/youtube-dl-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const youtubedlorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'youtube-dl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'youtube-dl.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command-line program to download videos from YouTube.com and other video sites' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/youtube-dl.org/package.yml' as const,
  homepageUrl: 'https://ytdl-org.github.io/youtube-dl/' as const,
  githubUrl: 'https://github.com/ytdl-org/youtube-dl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install youtube-dl.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +youtube-dl.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install youtube-dl.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'youtube-dl',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.8.4',
    '2021.12.17',
  ] as const,
  aliases: [] as const,
}

export type YoutubedlorgPackage = typeof youtubedlorgPackage
