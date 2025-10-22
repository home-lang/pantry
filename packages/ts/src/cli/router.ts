import process from 'node:process'
import { listCommands, resolveCommand } from '../commands'
import { parseArgv } from './parse'

export async function runCLI(rawArgv: string[] = process.argv.slice(2)): Promise<number> {
  const { command, argv } = parseArgv(rawArgv)

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp()
    return 0
  }

  const cmd = await resolveCommand(command)
  if (!cmd) {
    console.error(`Unknown command: ${command}`)
    printHelp()
    return 2
  }

  const code = await cmd.run({ argv, env: process.env })
  return typeof code === 'number' ? code : 0
}

function printHelp() {
  const commands = listCommands()
  console.log('Launchpad CLI')
  console.log('')
  console.log('Available commands:')
  for (const c of commands) console.log(`  • ${c}`)
  console.log('')
  console.log('Use: launchpad <command> [options]')
}
