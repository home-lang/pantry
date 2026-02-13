/**
 * **jupyter** - JupyterLab computational environment.
 *
 * @domain `jupyter.org`
 * @programs `jlpm`, `jupyter`, `jupyter-bundlerextension`, `jupyter-dejavu`, `jupyter-events`, ... (+19 more)
 * @version `4.5.2` (60 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jupyter.org`
 * @homepage https://jupyterlab.readthedocs.io/
 * @dependencies `python.org>=3.7<3.12`, `gnu.org/which@2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jupyterorg
 * console.log(pkg.name)        // "jupyter"
 * console.log(pkg.description) // "JupyterLab computational environment."
 * console.log(pkg.programs)    // ["jlpm", "jupyter", ...]
 * console.log(pkg.versions[0]) // "4.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jupyter-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jupyterorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'jupyter' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jupyter.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'JupyterLab computational environment.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jupyter.org/package.yml' as const,
  homepageUrl: 'https://jupyterlab.readthedocs.io/' as const,
  githubUrl: 'https://github.com/jupyterlab/jupyterlab' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jupyter.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jupyter.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jupyter.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jlpm',
    'jupyter',
    'jupyter-bundlerextension',
    'jupyter-dejavu',
    'jupyter-events',
    'jupyter-execute',
    'jupyter-fileid',
    'jupyter-kernel',
    'jupyter-kernelspec',
    'jupyter-lab',
    'jupyter-labextension',
    'jupyter-labhub',
    'jupyter-migrate',
    'jupyter-nbclassic',
    'jupyter-nbclassic-bundlerextension',
    'jupyter-nbclassic-extension',
    'jupyter-nbclassic-serverextension',
    'jupyter-nbconvert',
    'jupyter-nbextension',
    'jupyter-run',
    'jupyter-server',
    'jupyter-serverextension',
    'jupyter-troubleshoot',
    'jupyter-trust',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.7<3.12',
    'gnu.org/which@2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.5.2',
    '4.5.1',
    '4.5.0',
    '4.4.10',
    '4.4.9',
    '4.4.8',
    '4.4.7',
    '4.4.6',
    '4.4.5',
    '4.4.4',
    '4.4.3',
    '4.4.2',
    '4.4.1',
    '4.4.0',
    '4.3.8',
    '4.3.7',
    '4.3.6',
    '4.3.5',
    '4.3.4',
    '4.3.3',
    '4.3.2',
    '4.3.1',
    '4.3.0',
    '4.2.7',
    '4.2.6',
    '4.2.5',
    '4.2.4',
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.1.8',
    '4.1.7',
    '4.1.6',
    '4.1.5',
    '4.1.4',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.13',
    '4.0.12',
    '4.0.11',
    '4.0.10',
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.6.8',
    '3.6.7',
    '3.6.6',
    '3.6.5',
    '3.6.4',
    '3.6.3',
  ] as const,
  aliases: [] as const,
}

export type JupyterorgPackage = typeof jupyterorgPackage
