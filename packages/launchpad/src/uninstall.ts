import fs from 'node:fs'
import { install_prefix } from './install'
import { Path } from './path'

/**
 * Uninstall a package
 */
export async function uninstall(arg: string): Promise<boolean> {
  // Simplified implementation
  const projectName = arg

  const root = install_prefix()
  const dir = root.join('pkgs', projectName)

  if (!dir.isDirectory()) {
    console.error(`not installed: ${dir.string}`)

    if (
      root.string === '/usr/local'
      && Path.home().join('.local/pkgs', projectName).isDirectory()
    ) {
      console.error(
        `\x1B[33m! rerun without \`sudo\` to uninstall ~/.local/pkgs/${projectName}\x1B[0m`,
      )
    }
    else if (new Path('/usr/local/pkgs').join(projectName).isDirectory()) {
      console.error(
        `\x1B[33m! rerun as \`sudo\` to uninstall /usr/local/pkgs/${projectName}\x1B[0m`,
      )
    }

    return false
  }

  console.error('\x1B[31muninstalling\x1B[0m', dir.string)

  try {
    fs.rmSync(dir.string, { recursive: true, force: true })
    return true
  }
  catch (error) {
    console.error('Failed to uninstall:', error)
    return false
  }
}
