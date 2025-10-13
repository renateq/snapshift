import { execSync } from 'child_process'
import { join } from 'path'

function run(command, cwd) {
  console.log(`\n📦 Running "${command}" in ${cwd}`)
  execSync(command, { stdio: 'inherit', cwd })
}

const root = process.cwd()

try {
  // Install root dependencies
  run('npm ci', root)

  // Install Next.js 'client' dependencies
  run('npm ci', join(root, 'packages/client'))

  // Install Go 'server' dependencies
  run('go mod tidy', join(root, 'packages/server'))
  run('go mod download', join(root, 'packages/server'))

  console.log('\n✅ All dependencies installed successfully!')
} catch (err) {
  console.error('\n❌ Installation failed:', err.message)
  process.exit(1)
}
