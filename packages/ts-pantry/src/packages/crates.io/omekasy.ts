/**
 * **omekasy** - 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙡𝙞𝙣𝙚 𝙖𝙥𝙥𝙡𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝕥𝕙𝕒𝕥 𝕔𝕠𝕟𝕧𝕖𝕣𝕥𝕤 𝕒𝕝𝕡𝕙𝕒𝕟𝕦𝕞𝕖𝕣𝕚𝕔 𝕔𝕙𝕒𝕣𝕒𝕔𝕥𝕖𝕣𝕤 𝒕𝒐 𝒗𝒂𝒓𝒊𝒐𝒖𝒔 𝒔𝒕𝒚𝒍𝒆𝒔 𝚍𝚎𝚏𝚒𝚗𝚎𝚍 𝚒𝚗 𝚄𝚗𝚒𝚌𝚘𝚍𝚎.
 *
 * @domain `crates.io/omekasy`
 * @programs `omekasy`
 * @version `1.3.3` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/omekasy`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioomekasy
 * console.log(pkg.name)        // "omekasy"
 * console.log(pkg.description) // "𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙡𝙞𝙣𝙚 𝙖𝙥𝙥𝙡𝙞𝙘𝙖𝙩𝙞𝙤𝙣 ..."
 * console.log(pkg.programs)    // ["omekasy"]
 * console.log(pkg.versions[0]) // "1.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/omekasy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioomekasyPackage = {
  /**
  * The display name of this package.
  */
  name: 'omekasy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/omekasy' as const,
  /**
  * Brief description of what this package does.
  */
  description: '𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙡𝙞𝙣𝙚 𝙖𝙥𝙥𝙡𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝕥𝕙𝕒𝕥 𝕔𝕠𝕟𝕧𝕖𝕣𝕥𝕤 𝕒𝕝𝕡𝕙𝕒𝕟𝕦𝕞𝕖𝕣𝕚𝕔 𝕔𝕙𝕒𝕣𝕒𝕔𝕥𝕖𝕣𝕤 𝒕𝒐 𝒗𝒂𝒓𝒊𝒐𝒖𝒔 𝒔𝒕𝒚𝒍𝒆𝒔 𝚍𝚎𝚏𝚒𝚗𝚎𝚍 𝚒𝚗 𝚄𝚗𝚒𝚌𝚘𝚍𝚎.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/omekasy/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ikanago/omekasy' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/omekasy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/omekasy -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/omekasy' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'omekasy',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type CratesioomekasyPackage = typeof cratesioomekasyPackage
