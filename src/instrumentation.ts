// Runs once, before anything else: on a server at startup, on a Worker
// when its first request arrives. The entry imports this file first, so a
// package configured here is configured before any page module evaluates.
//
// env.ts validates on import. Importing it here means a missing variable
// stops the server from starting rather than reaching a visitor as a page
// that fails three calls later.
import './env'

// Anything asynchronous the app needs before its first request - warming a
// connection, checking a migration - goes here. The first render waits for
// it. Read environment inside this function, not at the top of the module,
// if the app deploys to a Worker: a binding is only readable once a request
// has arrived.
export async function register() {}
