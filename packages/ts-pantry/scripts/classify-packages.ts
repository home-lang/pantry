#!/usr/bin/env bun

import { classifyDomains, sanitizeDomainList } from './binary-sync-packages.ts'

const args = process.argv.slice(2)
const input = args.find(arg => !arg.startsWith('--')) || ''
const fieldArg = args.find(arg => arg.startsWith('--field='))
const field = fieldArg?.split('=', 2)[1]
const domains = sanitizeDomainList(input)
const classified = classifyDomains(domains)

if (field === 'binary') {
  console.log(classified.binary.join(','))
}
else if (field === 'source') {
  console.log(classified.source.join(','))
}
else {
  console.log(`binary=${classified.binary.join(',')}`)
  console.log(`source=${classified.source.join(',')}`)
  console.log(`has_binary=${classified.binary.length > 0 ? 'true' : 'false'}`)
  console.log(`has_source=${classified.source.length > 0 ? 'true' : 'false'}`)
}
