import { DEV_SERVER_PORT } from "../config";

// Vite color-codes the log (ESC[32m …)
// Strip those so STARTED/FATAL can match the plain text. 27 is the ESC byte; same as \u001B
export const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, 'g');

export const STARTED = new RegExp(`Local:\\s*https?://[^\\s/:]+:${DEV_SERVER_PORT}\\b`, 'i');

export const FATAL = /error when starting dev server/i;
