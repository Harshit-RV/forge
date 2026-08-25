import { configDotenv } from 'dotenv';
import { AgentBounds } from '../types';

configDotenv()

export const MODEL = 'claude-haiku-4-5-20251001';

export const AGENT_DEFAULT_BOUNDS: AgentBounds = {
    maxIterations: 60,
    maxWallClockMs: 20 * 60 * 1000, // 20 mins
    // cap on output tokens across the run
    maxTokens: 400_000,
    // each exec on sandbox has a 2 mins limit so hung processes don't block the agent
    commandTimeoutMs: 120_000,
};


export default {
    claudeApiKey: process.env.CLAUDE_API_KEY || '',
};