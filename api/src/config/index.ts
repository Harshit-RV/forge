import { configDotenv } from 'dotenv';

configDotenv()

export default {
    mongoURI: process.env.MONGO_URI || '',
    claudeApiKey: process.env.CLAUDE_API_KEY || '',
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
};