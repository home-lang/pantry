/**
 * **appstreamcli** - Tools and libraries to work with AppStream metadata
 *
 * @domain `freedesktop.org/appstream`
 * @programs `appstreamcli`
 * @version `1.1.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/appstream`
 * @homepage https://www.freedesktop.org/wiki/Distributions/AppStream/
 * @dependencies `gnome.org/glib@2`, `github.com/hughsie/libxmlb@0`, `pyyaml.org/libyaml@0`, ... (+5 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@3`, `mesonbuild.com@>=0.61`, `itstool.org`, ... (+4 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgappstream
 * console.log(pkg.name)        // "appstreamcli"
 * console.log(pkg.description) // "Tools and libraries to work with AppStream meta..."
 * console.log(pkg.programs)    // ["appstreamcli"]
 * console.log(pkg.versions[0]) // "1.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/appstream.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgappstreamPackage = {
  /**
  * The display name of this package.
  */
  name: 'appstreamcli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/appstream' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tools and libraries to work with AppStream metadata' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/appstream/package.yml' as const,
  homepageUrl: 'https://www.freedesktop.org/wiki/Distributions/AppStream/' as const,
  githubUrl: 'https://github.com/ximion/appstream' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/appstream' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/appstream -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/appstream' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'appstreamcli',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'gnome.org/glib@2',
    'github.com/hughsie/libxmlb@0',
    'pyyaml.org/libyaml@0',
    'github.com/pantoniou/libfyaml^0 # since 1.1.0',
    'curl.se@8',
    'gnome.org/libxml2@2',
    'darwin:openldap.org^2 # 1.0.4 needs it with curl',
    'linux:systemd.io',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@3',
    'mesonbuild.com@>=0.61',
    'itstool.org',
    'gnome.org/vala',
    'gnome.org/libxslt',
    'docbook.org/xsl',
    'linux:gnu.org/gperf',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgappstreamPackage = typeof freedesktoporgappstreamPackage
