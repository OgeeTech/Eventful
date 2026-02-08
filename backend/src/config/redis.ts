// ============================================================
// ⚠️ SAFE MODE: Redis is temporarily disabled for deployment
// This prevents the "WRONGPASS" error from crashing the build.
// ============================================================

// 1. Export a "Fake" Client
// We use 'as any' to trick TypeScript so we don't have to mock every function.
export const redisClient = {
    on: (event: string, callback: Function) => {
        // Do nothing
    },
    connect: async () => {
        console.log("⚠️ Redis Client: Connection skipped (Safe Mode)");
    },
    isOpen: false,
    get: async () => null,
    set: async () => null,
    del: async () => null,
} as any;

// 2. Export a "Fake" Connect Function
export const connectRedis = async () => {
    console.log("⚠️ connectRedis: Skipped (Safe Mode)");
};