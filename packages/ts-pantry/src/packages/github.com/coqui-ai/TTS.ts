/**
 * **TTS** - 🐸💬 - a deep learning toolkit for Text-to-Speech, battle-tested in research and production
 *
 * @domain `github.com/coqui-ai/TTS`
 * @programs `tts`, `tts-server`, `ttx`
 * @version `0.22.0` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/coqui-ai/TTS`
 * @homepage http://coqui.ai
 * @dependencies `python.org>=3.7<3.11`, `taku910.github.io/mecab`
 * @buildDependencies `pip.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcoquiaitts
 * console.log(pkg.name)        // "TTS"
 * console.log(pkg.description) // "🐸💬 - a deep learning toolkit for Text-to-Spee..."
 * console.log(pkg.programs)    // ["tts", "tts-server", ...]
 * console.log(pkg.versions[0]) // "0.22.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/coqui-ai/TTS.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ttsPackage = {
  /**
  * The display name of this package.
  */
  name: 'TTS' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/coqui-ai/TTS' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🐸💬 - a deep learning toolkit for Text-to-Speech, battle-tested in research and production' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/coqui-ai/TTS/package.yml' as const,
  homepageUrl: 'http://coqui.ai' as const,
  githubUrl: 'https://github.com/coqui-ai/TTS' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/coqui-ai/TTS' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/coqui-ai/TTS -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/coqui-ai/TTS' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tts',
    'tts-server',
    'ttx',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3.7<3.11',
    'taku910.github.io/mecab',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'pip.pypa.io',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.22.0',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.6',
    '0.20.5',
    '0.20.4',
    '0.20.3',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.10',
    '0.17.9',
    '0.17.8',
    '0.17.7',
    '0.17.6',
    '0.17.5',
    '0.17.4',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.16.6',
    '0.16.5',
    '0.16.4',
    '0.16.3',
    '0.16.2',
    '0.14.0',
  ] as const,
  aliases: [] as const,
}

export type TtsPackage = typeof ttsPackage
