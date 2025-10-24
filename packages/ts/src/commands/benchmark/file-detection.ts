import type { Command } from '../../cli/types'

const command: Command = {
  name: 'benchmark:file-detection',
  description: 'Benchmark file detection performance (shell vs Bun)',
  async run({ options }) {
    const { runFileDetectionBenchmark } = await import('../../dev/benchmark')
    const depths = typeof options?.depths === 'string'
      ? options.depths.split(',').map((d: string) => Number.parseInt(d.trim(), 10)).filter((d: number) => !Number.isNaN(d))
      : undefined
    const iterations = typeof options?.iterations === 'string'
      ? Number.parseInt(options.iterations, 10)
      : typeof options?.iterations === 'number'
        ? options.iterations
        : undefined
    await runFileDetectionBenchmark({
      depths,
      iterations,
      verbose: Boolean(options?.verbose),
      json: Boolean(options?.json),
    })
    return 0
  },
}

export default command
