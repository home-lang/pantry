const fs = require('node:fs')
const process = require('node:process')
const readline = require('node:readline')

const readInterface = readline.createInterface({
  input: fs.createReadStream(process.argv[2]),
  output: process.stdout,
  terminal: false,
})

function stripQuotes(str) {
  return str.startsWith('"') || str.startsWith('\'') ? str.slice(1, -1) : str
}

function replaceEnvVars(str) {
  const value = str
    .replaceAll(
      /\$\{(\w+):\+:\$\w+\}/g,
      (_, key) => (v => v ? `:${v}` : '')(process.env[key]),
    )
    .replaceAll(/\$\{(\w+)\}/g, (_, key) => process.env[key] ?? '')
    .replaceAll(/\$(\w+)/g, (_, key) => process.env[key] ?? '')
  return value
}

let found = false

readInterface.on('line', (line) => {
  if (!found)
    found = line.trim() === 'set -a'
  if (!found)
    return
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    // eslint-disable-next-line no-unused-vars
    const [_, key, value_] = match
    const value = stripQuotes(value_)
    if (key.trim() === 'PATH') {
      value
        .replaceAll('${PATH:+:$PATH}', '')
        .replaceAll('$PATH', '')
        .replaceAll('${PATH}', '')
        .split(':')
        .forEach((path) => {
          fs.appendFileSync(process.env.GITHUB_PATH, `${path}\n`)
        })
    }
    else {
      const v = replaceEnvVars(value)
      fs.appendFileSync(process.env.GITHUB_ENV, `${key}=${v}\n`)
    }
  }
})
