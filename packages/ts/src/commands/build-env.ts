/* eslint-disable no-console */
import type { Command } from '../cli/types'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const cmd: Command = {
  name: 'build-env',
  aliases: ['env'],
  description: 'Set up build environment for launchpad-installed packages',
  help: `
Examples:
  launchpad build-env
  launchpad build-env --path ~/.local/share/launchpad/global
  launchpad build-env --shell | source /dev/stdin
`,
  async run({ argv }): Promise<number> {
    // parse flags
    let customPath: string | undefined
    let shell = false
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i]
      if (a === '--path') {
        customPath = argv[i + 1]
        i++
      }
      else if (a === '--shell') {
        shell = true
      }
    }

    const defaultInstallPath = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
    const installPath = customPath || defaultInstallPath
    const buildEnvScript = path.join(installPath, 'build-env.sh')

    if (!fs.existsSync(buildEnvScript)) {
      console.error('❌ Build environment script not found. Please install some packages first.')
      console.error(`   Expected location: ${buildEnvScript}`)
      return 1
    }

    if (shell) {
      const scriptContent = fs.readFileSync(buildEnvScript, 'utf-8')
      console.log(scriptContent)
      return 0
    }

    execSync(`source "${buildEnvScript}"`, { stdio: 'inherit', shell: '/bin/sh' })
    return 0
  },
}

export default cmd
