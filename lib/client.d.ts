import type { Context } from '@deepseek-ai/cordis';
/** Cordis service injection and package activation dependencies are distinct contracts. */
export declare const inject: string[];
export declare function apply(ctx: Context): void;
