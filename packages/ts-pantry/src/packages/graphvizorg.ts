/**
 * **graphviz** - Graph visualization software from AT&T and Bell Labs
 *
 * @domain `graphviz.org`
 * @programs `acyclic`, `bcomps`, `ccomps`, `circo`, `cluster`, ... (+30 more)
 * @version `14.1.2` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install graphviz.org`
 * @homepage https://graphviz.org/
 * @dependencies `cairographics.org^1.1.10`, `freedesktop.org/fontconfig^2.3.95`, `freetype.org^2.1.0`, ... (+7 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.graphvizorg
 * console.log(pkg.name)        // "graphviz"
 * console.log(pkg.description) // "Graph visualization software from AT&T and Bell..."
 * console.log(pkg.programs)    // ["acyclic", "bcomps", ...]
 * console.log(pkg.versions[0]) // "14.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/graphviz-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const graphvizorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'graphviz' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'graphviz.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Graph visualization software from AT&T and Bell Labs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/graphviz.org/package.yml' as const,
  homepageUrl: 'https://graphviz.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install graphviz.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +graphviz.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install graphviz.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'acyclic',
    'bcomps',
    'ccomps',
    'circo',
    'cluster',
    'dijkstra',
    'dot',
    'dot2gxl',
    'dot_builtins',
    'edgepaint',
    'fdp',
    'gc',
    'gml2gv',
    'graphml2gv',
    'gv2gml',
    'gv2gxl',
    'gvcolor',
    'gvgen',
    'gvmap',
    'gvmap.sh',
    'gvpack',
    'gvpr',
    'gxl2dot',
    'gxl2gv',
    'mm2gv',
    'neato',
    'nop',
    'osage',
    'patchwork',
    'prune',
    'sccmap',
    'sfdp',
    'tred',
    'twopi',
    'unflatten',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'cairographics.org^1.1.10',
    'freedesktop.org/fontconfig^2.3.95',
    'freetype.org^2.1.0',
    'gnome.org/glib^2.11.0',
    'gnome.org/pango^1.12.4',
    'gnu.org/libtool^2',
    'libexpat.github.io^2.0.0',
    'libpng.org^1.2.10',
    'poppler.freedesktop.org',
    'zlib.net^1.2.3',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '14.1.2',
    '14.1.1',
    '14.1.0',
    '14.0.5',
    '14.0.4',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.1.2',
    '13.1.1',
    '13.1.0',
    '13.0.1',
    '13.0.0',
    '12.2.1',
    '12.2.0',
    '12.1.2',
    '12.1.1',
    '12.1.0',
    '12.0.0',
    '11.0.0',
    '10.0.1',
    '9.0.0',
    '8.1.0',
    '7.1.0',
  ] as const,
  aliases: [] as const,
}

export type GraphvizorgPackage = typeof graphvizorgPackage
