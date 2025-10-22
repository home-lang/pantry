export interface ParsedCLI {
  command?: string
  argv: string[]
}

// Minimal argv parser for our lightweight router. Leaves option parsing to commands.
export function parseArgv(raw: string[]): ParsedCLI {
  // raw is typically process.argv.slice(2)
  const [command, ...rest] = raw
  return { command, argv: rest }
}
