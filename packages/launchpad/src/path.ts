import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { config } from './config'

// Path class replacement for the Deno Path class
export class Path {
  string: string

  constructor(pathStr: string) {
    this.string = pathStr
  }

  static home(): Path {
    return new Path(homedir())
  }

  join(...parts: string[]): Path {
    return new Path(path.join(this.string, ...parts))
  }

  isDirectory(): boolean {
    try {
      return fs.statSync(this.string).isDirectory()
    }
    catch {
      return false
    }
  }

  exists(): boolean {
    return fs.existsSync(this.string)
  }

  parent(): Path {
    return new Path(path.dirname(this.string))
  }

  basename(): string {
    return path.basename(this.string)
  }

  relative({ to }: { to: Path }): string {
    return path.relative(to.string, this.string)
  }

  async* ls(): AsyncGenerator<readonly [Path, { name: string, isDirectory: boolean, isSymlink: boolean }], void, unknown> {
    try {
      for (const entry of fs.readdirSync(this.string, { withFileTypes: true })) {
        const entryPath = new Path(path.join(this.string, entry.name))
        yield [entryPath, {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isSymlink: entry.isSymbolicLink(),
        }] as const
      }
    }
    catch (error) {
      if (config.verbose)
        console.error(`Error reading directory ${this.string}:`, error)
    }
  }
}
