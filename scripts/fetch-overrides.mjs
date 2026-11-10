import { syncImageOverrides } from './lib/overrides.mjs'

syncImageOverrides().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
