import { configDotenv } from 'dotenv';

configDotenv()

export default {
    mongoURI: process.env.MONGO_URI || '',
    claudeApiKey: process.env.CLAUDE_API_KEY || '',
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
    sandboxIdleMs: Number(process.env.SANDBOX_IDLE_MS) || 5 * 60 * 1000,
    sandboxSweepMs: Number(process.env.SANDBOX_SWEEP_MS) || 30 * 1000,
};