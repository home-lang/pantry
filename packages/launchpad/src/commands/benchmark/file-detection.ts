import type { Command } from '../../cli/types'

function parseArgs(argv: string[]): { depths?: number[], iterations?: number, verbose?: boolean, json?: boolean } {
  const result: { depths?: number[], iterations?: number, verbose?: boolean, json?: boolean } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--verbose') {
      result.verbose = true
    }
    else if (a === '--json') {
      result.json = true
    }
    else if (a === '--iterations' && i + 1 < argv.length) {
      const v = Number.parseInt(argv[++i], 10)
      if (!Number.isNaN(v))
        result.iterations = v
    }
    else if (a === '--depths' && i + 1 < argv.length) {
      const v = String(argv[++i])
      const depths = v.split(',').map(d => Number.parseInt(d.trim(), 10)).filter(d => !Number.isNaN(d))
      if (depths.length > 0)
        result.depths = depths
    }
  }
  return result
}

const command: Command = {
  name: 'benchmark:file-detection',
  description: 'Benchmark file detection performance (shell vs Bun)',
  async run({ argv }) {
    const { runFileDetectionBenchmark } = await import('../../dev/benchmark')
    const opts = parseArgs(argv)
    await runFileDetectionBenchmark({
      depths: opts.depths,
      iterations: opts.iterations,
      verbose: opts.verbose,
      json: opts.json,
    })
    return 0
  },
}

export default command
