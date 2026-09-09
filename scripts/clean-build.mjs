import { rm } from 'node:fs/promises';
// Only remove generated build output; prevent older static builds entering a Worker archive.
await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
