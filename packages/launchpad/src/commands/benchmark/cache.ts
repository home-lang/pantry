import type { Command } from '../../cli/types'

const command: Command = {
  name: 'benchmark:cache',
  description: 'Benchmark cache lookup performance (in-memory vs disk)',
  async run({ options }) {
    const { runCacheBenchmark } = await import('../../dev/benchmark')
    const iterations = typeof options?.iterations === 'string'
      ? Number.parseInt(options.iterations, 10)
      : typeof options?.iterations === 'number'
        ? options.iterations
        : undefined
    await runCacheBenchmark({
      iterations,
      verbose: Boolean(options?.verbose),
      json: Boolean(options?.json),
    })
    return 0
  },
}

export default command
