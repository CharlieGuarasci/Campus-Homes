import path from 'path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

// Prisma CLI doesn't load Next.js env files, so we load .env.development manually.
// For production CLI operations, set DATABASE_URL in the environment directly.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
