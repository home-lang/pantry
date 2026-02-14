/**
 * **spm** - Unsupervised text tokenizer for Neural Network-based text generation.
 *
 * @domain `google.com/sentencepiece`
 * @programs `spm_decode`, `spm_encode`, `spm_export_vocab`, `spm_normalize`, `spm_train`
 * @version `0.2.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/sentencepiece`
 * @buildDependencies `cmake.org@^3`, `python.org@~3.11`, `pip.pypa.io`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomsentencepiece
 * console.log(pkg.name)        // "spm"
 * console.log(pkg.description) // "Unsupervised text tokenizer for Neural Network-..."
 * console.log(pkg.programs)    // ["spm_decode", "spm_encode", ...]
 * console.log(pkg.versions[0]) // "0.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/sentencepiece.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomsentencepiecePackage = {
  /**
  * The display name of this package.
  */
  name: 'spm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/sentencepiece' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Unsupervised text tokenizer for Neural Network-based text generation.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/sentencepiece/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/sentencepiece' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install google.com/sentencepiece' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/sentencepiece -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/sentencepiece' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'spm_decode',
    'spm_encode',
    'spm_export_vocab',
    'spm_normalize',
    'spm_train',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
    'python.org@~3.11',
    'pip.pypa.io',
    'protobuf.dev@25',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.1',
    '0.2.0',
    '0.1.99',
    '0.1.98',
    '0.1.97',
  ] as const,
  aliases: [] as const,
}

export type GooglecomsentencepiecePackage = typeof googlecomsentencepiecePackage
