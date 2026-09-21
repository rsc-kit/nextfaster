import { mock } from 'bun:test'

// The build honours this import and resolves it to nothing on the server;
// the real package throws when imported, which is what a test would hit.
mock.module('server-only', () => ({}))
mock.module('client-only', () => ({}))
