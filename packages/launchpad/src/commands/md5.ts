/* eslint-disable no-console */
import type { Buffer } from 'node:buffer'
import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'md5',
  description: 'Compute MD5 hash of a file (first 8 characters)',
  async run({ argv }) {
    const fs = await import('node:fs')

    try {
      const file = argv[0]
      if (!file) {
        console.log('')
        return 0
      }

      let content: Buffer
      if (file === '/dev/stdin')
        content = fs.readFileSync(0)
      else
        content = fs.readFileSync(file)

      const hasher = new Bun.CryptoHasher('md5')
      hasher.update(content)
      const hash = hasher.digest('hex')
      console.log(hash.slice(0, 8))
      return 0
    }
    catch {
      console.log('')
      return 0
    }
  },
}

export default cmd
