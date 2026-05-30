import net from 'node:net'

/**
 * Allocate a free TCP port from the OS ephemeral range.
 *
 * Tests previously picked a random port out of a fixed per-file range
 * (`3000 + random(1000)`, etc.). With test files running in parallel that
 * occasionally collided and surfaced as a flaky "fetch failed". Letting the OS
 * assign the port (`listen(0)`) hands out distinct, currently-free ports, so
 * concurrent suites can't clash.
 */
export async function getAvailablePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, () => {
      const address = probe.address()
      probe.close(() => {
        if (typeof address === 'object' && address?.port)
          resolve(address.port)
        else
          reject(new Error('Could not allocate a free test port'))
      })
    })
  })
}
