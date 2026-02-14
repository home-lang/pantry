/**
 * **git** - Git Source Code Mirror - This is a publish-only repository but pull requests can be turned into patches to the mailing list via GitGitGadget (https://gitgitgadget.github.io/). Please follow Documentation/SubmittingPatches procedure for any of your improvements.
 *
 * @domain `git-scm.org`
 * @programs `git`, `git-cvsserver`, `git-receive-pack`, `git-shell`, `git-upload-archive`, ... (+3 more)
 * @version `2.53.0` (34 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install git-scm.org`
 * @dependencies `zlib.net@1`, `curl.se>=5`, `curl.se/ca-certs`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `pkgx.sh@>=1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitscmorg
 * console.log(pkg.name)        // "git"
 * console.log(pkg.description) // "Git Source Code Mirror - This is a publish-only..."
 * console.log(pkg.programs)    // ["git", "git-cvsserver", ...]
 * console.log(pkg.versions[0]) // "2.53.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/git-scm-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitscmorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'git' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'git-scm.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Git Source Code Mirror - This is a publish-only repository but pull requests can be turned into patches to the mailing list via GitGitGadget (https://gitgitgadget.github.io/). Please follow Documentation/SubmittingPatches procedure for any of your improvements.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/git-scm.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/git/git' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install git-scm.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +git-scm.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git-scm.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git',
    'git-cvsserver',
    'git-receive-pack',
    'git-shell',
    'git-upload-archive',
    'git-upload-pack',
    'scalar',
    'git-credential-osxkeychain',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'zlib.net@1',
    'curl.se>=5',
    'curl.se/ca-certs',
    'perl.org',
    'libexpat.github.io~2',
    'linux:gnu.org/gettext^0.21',
    'linux:gnu.org/libiconv',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'pkgx.sh@>=1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.53.0',
    '2.51.2',
    '2.51.1',
    '2.51.0',
    '2.50.1',
    '2.50.0',
    '2.49.1',
    '2.49.0',
    '2.48.2',
    '2.48.0',
    '2.47.3',
    '2.47.1',
    '2.47.0',
    '2.46.4',
    '2.46.2',
    '2.46.1',
    '2.46.0',
    '2.45.4',
    '2.45.2',
    '2.45.0',
    '2.44.4',
    '2.44.0',
    '2.43.7',
    '2.43.3',
    '2.43.2',
    '2.43.1',
    '2.43.0',
    '2.42.1',
    '2.42.0',
    '2.41.0',
    '2.40.0',
    '2.39.1',
    '2.39.0',
    '2.38.1',
  ] as const,
  aliases: [] as const,
}

export type GitscmorgPackage = typeof gitscmorgPackage
