/** Child Action command streams bypass the runner's masking before artifact writes. */
export function redactFixtureOutput(output: string, secrets: Array<string | undefined> = []): string {
  const values = new Set(secrets.filter((value): value is string => !!value))
  for (const match of output.matchAll(/^::add-mask::([^\r\n]+)/gm)) {
    values.add(match[1])
    values.add(match[1].replaceAll('%0D', '\r').replaceAll('%0A', '\n').replaceAll('%25', '%'))
  }
  let redacted = output.replace(/^::add-mask::[^\r\n]*/gm, '::add-mask::***')
  for (const value of [...values].filter(Boolean).sort((left, right) => right.length - left.length))
    redacted = redacted.replaceAll(value, '***')
  return redacted
}
