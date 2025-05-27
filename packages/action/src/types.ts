/**
 * Input parameters for the launchpad-installer GitHub Action
 */
export interface ActionInputs {
  /**
   * Space-separated list of packages to install
   */
  packages: string

  /**
   * Path to launchpad config file
   */
  configPath: string
}
