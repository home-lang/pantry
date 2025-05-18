import { CAC } from 'cac'
import { version } from '../package.json'

const cli = new CAC('launchpad')

interface CliOption {
  verbose: boolean
}

cli
  .command('pkg', 'Some description')
  .option('--verbose', 'Enable verbose logging')
  .example('pkg install glow')
  .action(async (options?: CliOption) => {
    console.log('Options:', options)
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
