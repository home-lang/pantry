/**
 * **PortAudio** - PortAudio is a cross-platform, open-source C language library for real-time audio input and output.
 *
 * @domain `portaudio.com`
 * @version `19.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install portaudio.com`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.portaudiocom
 * console.log(pkg.name)        // "PortAudio"
 * console.log(pkg.description) // "PortAudio is a cross-platform, open-source C la..."
 * console.log(pkg.versions[0]) // "19.7.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/portaudio-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const portaudiocomPackage = {
  /**
  * The display name of this package.
  */
  name: 'PortAudio' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'portaudio.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'PortAudio is a cross-platform, open-source C language library for real-time audio input and output.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/portaudio.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/PortAudio/portaudio' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install portaudio.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +portaudio.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install portaudio.com' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '19.7.0',
  ] as const,
  aliases: [] as const,
}

export type PortaudiocomPackage = typeof portaudiocomPackage
