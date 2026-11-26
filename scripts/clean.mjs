// lib/ mirrors src/ layers; remove stale output so moved modules cannot linger.
import { rmSync } from 'node:fs';
rmSync(new URL('../lib/', import.meta.url), { recursive: true, force: true });
