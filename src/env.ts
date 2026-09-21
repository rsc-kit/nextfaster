import * as z from 'zod'
import { createEnv } from '@t3-oss/env-core'

// Read once, here, and refused with the variable named when one is missing
// or wrong - before anything runs, not as an undefined three calls later.
//
// Server variables stay on the server. A variable the browser may read has
// to start with PUBLIC_, and is read from import.meta.env, which is what Vite
// exposes there. Add a variable: one line in the schema, and every reader is
// typed.
const processEnv: Record<string, string | undefined> = typeof process === 'undefined' ? {} : process.env

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Signs the session cookie. Any long random string; rotate it to sign
    // everyone out.
    SESSION_SECRET: z.string().min(16).default('nextfaster-dev-secret-not-for-production'),
  },
  clientPrefix: 'PUBLIC_',
  client: {
    // Where the 2,587 product images live: the R2 bucket's public url, no
    // trailing slash. Locally the same bucket, so dev shows real pictures.
    PUBLIC_IMAGES_URL: z.url().default('https://images.faster.rsc-kit.dev'),
  },
  // process is the server's; a "use client" file importing this for a
  // PUBLIC_ value has only import.meta.env, and Vite fills the PUBLIC_ ones.
  runtimeEnv: { ...processEnv, ...import.meta.env },
  emptyStringAsUndefined: true,
  // A build machine without the production variables: SKIP_ENV_VALIDATION=1
  // builds anyway, and the server that runs the build validates at startup.
  skipValidation: !!processEnv.SKIP_ENV_VALIDATION,
})
