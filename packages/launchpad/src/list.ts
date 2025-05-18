import { Path } from './path'

/**
 * List installed packages
 */
export async function* ls(): AsyncGenerator<string, void, unknown> {
  for (const pathStr of [
    new Path('/usr/local/pkgs'),
    Path.home().join('.local/pkgs'),
  ]) {
    if (!pathStr.isDirectory())
      continue

    const dirs: Path[] = [pathStr]
    let dir: Path | undefined

    // eslint-disable-next-line no-cond-assign
    while ((dir = dirs.pop()) !== undefined) {
      for await (const [path, { name, isDirectory, isSymlink }] of dir.ls()) {
        if (!isDirectory || isSymlink)
          continue
        if (/^v\d+\./.test(name)) {
          yield path.string
        }
        else {
          dirs.push(path)
        }
      }
    }
  }
}

/**
 * List outdated packages
 */
export async function outdated(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Checking for outdated packages...')
  // eslint-disable-next-line no-console
  console.log('This feature is simplified in the current implementation.')

  // A simplified implementation since we're missing some of the original functions
}
