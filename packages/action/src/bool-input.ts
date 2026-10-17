import * as core from '@actions/core'

/**
 * Lenient boolean input parser. GitHub Actions passes every input as a string,
 * and `core.getBooleanInput` throws on anything but `true`/`false` (any case).
 * Accept the common forms — true/false, 1/0, yes/no, on/off — so both quoted
 * (`release: 'true'`) and bare YAML booleans (`release: true`) work, and fall
 * back to `fallback` when the input is empty.
 */
export function boolInput(name: string, fallback: boolean): boolean {
  const raw = core.getInput(name).trim().toLowerCase()
  if (raw === '')
    return fallback
  if (raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on')
    return true
  if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off')
    return false
  throw new Error(`Input "${name}" must be a boolean (true/false), got: ${raw}`)
}

