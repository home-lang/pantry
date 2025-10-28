/**
 * Input parameters for the pantry-installer GitHub Action
 */
export interface ActionInputs {
  /**
   * Space-separated list of packages to install
   */
  packages: string

  /**
   * Path to pantry config file
   */
  configPath: string
}
